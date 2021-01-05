/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const Crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { User } = require('../models/User');
const { Token } = require('../models/Token');

// eslint-disable-next-line import/order
const { ObjectId } = require('mongoose').Types;

require('../../config/passportLocal');
require('../../config/passportGoogle');
require('../../config/passportLinkedin');

/**
 * @description Login local
 * @method      POST /api/v1/auth/signin
 * @access      Public
 */
module.exports.signinLocal = asyncHandler(async (req, res, next) => {
	passport.authenticate('signin', async (err, user, info) => {
		try {
			if (err || !user) {
				const errorMessage = err !== null ? err.message : 'Please provide a valid user credentials';
				const statusCode = err != null ? err.statusCode : 400;
				return next(new ErrorResponse(errorMessage, statusCode));
			}

			req.user = user;
			next();
		} catch (error) {
			return next(new ErrorResponse(error.message, error.statusCode));
		}
	})(req, res, next);
});

/**
 * @description Signup local
 * @method      POST /api/v1/auth/signup
 * @access      Public
 */
module.exports.signupLocal = passport.authenticate('signup', {
	session: false,
	successRedirect: '/',
	failureRedirect: '/fail',
});

/**
 * @description Forgot password
 * @method      PATCH /api/v1/auth/forgotPassword
 * @access      Public
 */
module.exports.forgotPassword = asyncHandler(async (req, res, next) => {
	if (req.body.email === '') next(new ErrorResponse(`Email required`, 400));
	const user = await User.findOne({ email: req.body.email });
	if (!user || user.google.id || user.linkedin.id) {
		next(new ErrorResponse(`Email not found`, 403));
	} else {
		const token = Crypto.randomBytes(20).toString('hex');
		await user.update({
			resetPasswordToken: token,
			resetPasswordExpire: Date.now() + 3600000,
		});
		// send to client via email => on link click go to /reset/{token}
		res.json({
			resetPasswordToken: token,
			message: 'go to /resetPassword/{token}',
		});
	}
});

/**
 * @description Reset password
 * @method      PATCH /api/v1/auth/resetPassword/:resetPasswordToken
 * @access      Public
 */
module.exports.resetPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.resetPasswordToken,
		resetPasswordExpire: { $gte: Date.now() },
	});
	if (!user) {
		next(new ErrorResponse('Link is invalid or expired', 403));
	} else {
		// test empty pass ?
		const salt = await bcrypt.genSalt(config.get('BCRYPT_SALT_ROUNDS'));
		const hashedPassword = await bcrypt.hash(req.body.password, salt);
		await user.update({
			password: hashedPassword,
			resetPasswordToken: null,
			resetPasswordExpires: null,
		});

		res.json({
			success: true,
			message: 'Password has been reset successfully.',
		});
	}
});

/**
 * @description Login google
 * @method      GET /api/v1/auth/google
 * @access      Public
 */
module.exports.authenticateGoogle = passport.authenticate('google', {
	scope: ['openid', 'email', 'profile'],
});

/**
 * @description Google auth callback
 * @method      GET /api/v1/auth/google/callback
 * @access      Public
 */
module.exports.callbackGoogle = asyncHandler(async (req, res, next) => {
	passport.authenticate('google', async (err, user, info) => {
		try {
			if (err || !user) {
				const errorMessage = err !== null ? err.message : 'Please provide a valid user credentials';
				const statusCode = err != null ? err.statusCode : 400;
				return next(new ErrorResponse(errorMessage, statusCode));
			}
			req.user = user;
			next();
		} catch (error) {
			return next(new ErrorResponse(error.message, error.statusCode));
		}
	})(req, res, next);
});

/**
 * @description Login linkedin
 * @method      GET /api/v1/auth/linkedin
 * @access      Public
 */
module.exports.authenticateLinkedin = passport.authenticate('linkedin', {
	scope: ['r_emailaddress', 'r_liteprofile'],
});

/**
 * @description Callback linkedin
 * @method      GET /api/v1/auth/linkedin/callback
 * @access      Public
 */
module.exports.callbackLinkedin = asyncHandler(async (req, res, next) => {
	passport.authenticate('linkedin', async (err, user, info) => {
		try {
			if (err || !user) {
				const errorMessage = err !== null ? err.message : 'Please provide a valid user credentials';
				const statusCode = err != null ? err.statusCode : 400;
				return next(new ErrorResponse(errorMessage, statusCode));
			}
			req.user = user;
			next();
		} catch (error) {
			return next(new ErrorResponse(error.message, error.statusCode));
		}
	})(req, res, next);
});

/**
 * @description Current logged in user
 * @method      GET /api/v1/auth/me
 * @access      Private
 */
module.exports.getMe = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	if (!user) return next(new ErrorResponse('Bad Request', 400));

	let current;

	const tokens = await Token.find({
		user: user._id,
		token_deleted: false,
	});
	tokens.forEach((t) => {
		if (req.token === t._id.toString()) {
			current = t;
		}
	});
	return res.status(200).send({ user, tokens, current, count: tokens.length });
});

/**
 * @description Refresh token
 * @method      POST /api/v1/auth/refresh
 * @access      Private [every app user]
 */
module.exports.refreshToken = asyncHandler(async (req, res) => {
	const jidToken = req.cookies.jid;
	if (!token) return res.send({ accessToken: '' });

	jwt.verify(jidToken, config.get('JWT.REFRESH_TOKEN.SECRET'), async (err, payload) => {
		if (err) return res.sendStatus(403);
		if (payload) {
			const user = await User.findById(payload.id);
			if (!user) return next(new ErrorResponse(`Ressource with id ${user._id} not found`, 404));

			// what about the Token id (model)

			// if the versions missmatch => the token have been revoked => can not use them anymore
			if (user.tokenVersion !== payload.version) return res.send({ accessToken: '' });

			// refresh the REFRESH_TOKEN if the users continue to use the website
			const refreshToken = await jwt.sign(
				{ id: payload.id, version: user.tokenVersion },
				config.get('JWT.REFRESH_TOKEN.SECRET'),
			);
			res.cookies('jid', refreshToken, {
				httpOnly: true,
			});

			// Send a new ACCESS_TOKEN
			const accessToken = await jwt.sign(payload.id, config.get('JWT.ACCESS_TOKEN.SECRET'));
			return res.send({ accessToken });
		}
	});
});
/**
 * @description Revoke refresh tokens
 * @method      GET /api/v1/auth/revoke/:id
 * @access      Private [Admin]
 */
module.exports.revokeRefreshToken = asyncHandler(async (req, res) => {
	/**
	 * if user :
	 * 		get hacked
	 * 		forgot password
	 * they can still use the app (amount of expire in access token ex : 15 minutes)
	 */
	const user = await User.findById(req.params.id);
	if (!user) return next(new ErrorResponse(`Ressource with id ${user._id} not found`, 404));

	user.tokenVersion += 1;
	await user.save();
	res.send({
		success: true,
		message: `Previous tokens for the user ${user._id} with version ${
			user.tokenVersion - 1
		} are not accessible anymore`,
	});
});

/**
 * @description Logout
 * @method      GET /api/v1/auth/logout
 * @access      Private
 */
module.exports.logout = asyncHandler(async (req, res) => {
	const token = await Token.findById(ObjectId(req.token));
	token.logged_out = true;
	token.logged_out_at = Date.now();
	token.save();
	req.logout();
	return res.json({ message: 'Logged out successfully.' });
});
