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
				const errorMessage = err ? err.message : 'Please provide a valid user credentials';
				const statusCode = err ? err.statusCode : 400;
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
	// accessType: 'offline',
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

	// return res.status(200).send({ user, tokens, current, count: tokens.length });
	return res.status(200).send(user);
});

/**
 * @description Refresh token
 * @method      POST /api/v1/auth/refresh
 * @access      Private [every app user]
 */
module.exports.refreshToken = asyncHandler(async (req, res, next) => {

	const options = {
		httpOnly: true, // client can't get cookie by script
		secure: true, // only transfer over https
		sameSite: true, // only sent for requests to the same FQDN as the domain in the cookie
	};

	const jidrToken = req.cookies.jidr;
	if (!jidrToken) return next(new ErrorResponse(`Cannot refresh this token`, 401));

	jwt.verify(jidrToken, config.get('JWT.REFRESH_TOKEN.SECRET'), async (err, payload) => {
		if (err) return res.sendStatus(403);
		if (payload) {

			const { id, version } = payload;

			const user = await User.findById(payload.id);
			if (!user) return next(new ErrorResponse(`Ressource with id ${user._id} not found`, 404));

			// if the versions missmatch => the token have been revoked => can not use them anymore
			if (user.tokenVersion !== payload.version) return next(new ErrorResponse('Access revoked', 401));

			req.user = user;
			const refreshToken = await jwt.sign({ id, version }, config.get('JWT.REFRESH_TOKEN.SECRET'), {
				expiresIn: config.get('JWT.REFRESH_TOKEN.EXPIRE'),
			});
			res.cookie('jidr', refreshToken, { ...options, maxAge: 1000 * 3600 * 24 * 7 });

			const accessToken = await jwt.sign({ id, version }, config.get('JWT.ACCESS_TOKEN.SECRET'), {
				expiresIn: config.get('JWT.ACCESS_TOKEN.EXPIRE'),
			});

			res.cookie('jida', accessToken, { ...options, /*maxAge: 1000 * 60 * 15*/ });
			res.send({ success: true, message: 'Successfully refreshed' });
		} else return next(new ErrorResponse(`Cannot refresh this token`, 401));

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
	 * 		did not login for a long time
	 * they can still use the app (amount of expire in access token ex : 15 minutes)
	 */
	const user = await User.findById(req.params.id);
	if (!user) return next(new ErrorResponse(`Ressource with id ${user._id} not found`, 404));

	user.tokenVersion += 1;
	await user.save();
	res.send({
		success: true,
		message: `Previous tokens for the user ${user._id} with version ${user.tokenVersion - 1
			} are not accessible anymore`,
	});
});

/**
 * @description Logout
 * @method      GET /api/v1/auth/logout
 * @access      Private
 */
module.exports.logout = asyncHandler(async (req, res, next) => {
	const jidtoken = req.cookies.jida;
	if (!jidtoken) return next(new ErrorResponse(`Token not found`, 404));

	const token = await Token.find({ user: ObjectId(req.user._id) });
	if (!token) return next(new ErrorResponse(`Token not found`, 404));

	token.logged_out = true;
	token.logged_out_at = Date.now();
	Token.updateOne(token);

	res.cookie('jida', null, {
		httpOnly: true,
		secure: true,
		sameSite: true,
		maxAge: 0
	});

	res.cookie('jidr', null, {
		httpOnly: true,
		secure: true,
		sameSite: true,
		maxAge: 0
	});

	req.logout();

	return res.json({ success: true, message: 'Logged out successfully.' });
});
