/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const bcrypt = require('bcrypt');
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
			req.auth = {
				id: req.user.id,
				register: false,
			};

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
			req.auth = {
				id: req.user.id,
				register: false,
			};
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
			req.auth = {
				id: req.user.id,
				register: false,
			};
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
