const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('config');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

require('../../config/passportLocal');
require('../../config/passportGoogle');
require('../../config/passportLinkedin');

/**
 * @description Login local
 * @method      GET /api/v1/auth/signin
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
 * @method      GET /api/v1/auth/signup
 * @access      Public
 */
module.exports.signupLocal = passport.authenticate('signup', {
	session: false,
	successRedirect: '/',
	failureRedirect: '/fail',
});

/**
 * @description Login google
 * @method      GET /api/v1/auth/google
 * @access      Public
 */
module.exports.authenticateGoogle = passport.authenticate('google', {
	session: false,
	scope: ['openid', 'email', 'profile'],
});

/**
 * @description Google auth callback
 * @method      GET /api/v1/auth/google/callback
 * @access      Public
 */
module.exports.callbackGoogle = asyncHandler(async (req, res, next) => {
	passport.authenticate('google', { session: false }, async (err, user, info) => {
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
	session: false,
	scope: ['r_emailaddress', 'r_liteprofile'],
});

/**
 * @description Callback linkedin
 * @method      GET /api/v1/auth/linkedin/callback
 * @access      Public
 */
module.exports.callbackLinkedin = asyncHandler(async (req, res, next) => {
	passport.authenticate('linkedin', { session: false }, async (err, user, info) => {
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
 * @access      Public
 */
module.exports.getMe = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user);
	res.status(200).json({
		data: user,
	});
});

/**
 * @description Logout
 * @method      POST /api/v1/auth/logout
 * @access      Public
 */
module.exports.logout = asyncHandler(async (req, res) => {
	req.logout();
	res.redirect('/');
});
