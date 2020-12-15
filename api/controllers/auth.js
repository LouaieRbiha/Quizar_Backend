const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('config');
const asyncHandler = require('../middlewares/async');
require('../utils/passportLocal');
require('../utils/passportGoogle');
require('../utils/passportLinkedin');

/**
 * @description Login local
 * @method      GET /api/v1/auth/signin
 * @access      Public
 */
module.exports.signinLocal = asyncHandler(async (req, res, next) => {
	passport.authenticate('signin', async (err, user, info) => {
		try {
			if (err || !user) {
				const error = new Error('An error occurred.');

				return next(error);
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error);

				// eslint-disable-next-line no-underscore-dangle
				const body = { _id: user._id, email: user.email };
				const token = jwt.sign({ user: body }, config.get('JWT_SECRET'));

				return res.json({ token });
			});
		} catch (error) {
			return next(error);
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
 * @description Secure local route
 * @method      GET /api/v1/auth/secure
 * @access      Private
 */
module.exports.secureLocal = asyncHandler(async (req, res, next) => {
	res.json({
		message: 'You made it to the secure route',
		user: req.user,
		token: req.query.secret_token,
	});
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
module.exports.callback = asyncHandler(async (req, res, next) => {
	passport.authenticate('google', { session: false }, async (err, user, info) => {
		try {
			if (err || !user) {
				const error = new Error('An error occurred.');

				return next(error);
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error);

				// eslint-disable-next-line no-underscore-dangle
				const body = { _id: user._id, email: user.email };
				const token = jwt.sign({ user: body }, config.get('JWT_SECRET'));

				return res.json({ token });
			});
		} catch (error) {
			return next(error);
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
				const error = new Error('An error occurred.');

				return next(error);
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error);

				// eslint-disable-next-line no-underscore-dangle
				const body = { _id: user._id, email: user.email };
				const token = jwt.sign({ user: body }, config.get('JWT_SECRET'));

				return res.json({ token });
			});
		} catch (error) {
			return next(error);
		}
	})(req, res, next);
});

/**
 * @description Current logged in user
 * @method      GET /api/v1/auth/me
 * @access      Public
 */
module.exports.me = asyncHandler(async (req, res) => {
	res.send(req.user);
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
