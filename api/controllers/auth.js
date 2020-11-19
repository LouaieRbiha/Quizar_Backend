const passport = require('passport');
const asyncHandler = require('../middlewares/async');
require('../utils/passport');

/**
 * @description Login google
 * @method      GET /api/v1/auth/google
 * @access      Public
 */
module.exports.authenticate = passport.authenticate('google', { scope: ['email', 'profile'] });

/**
 * @description Google auth callback
 * @method      GET /api/v1/auth/google/callback
 * @access      Public
 */
module.exports.callback = passport.authenticate('google', {
	successRedirect: '/api/v1/auth/google/success',
	failureRedirect: '/api/v1/auth/google/failure',
});

/**
 * @description Google auth success
 * @method      GET /api/v1/auth/google/success
 * @access      Public
 */
module.exports.success = asyncHandler(async (req, res) => {
	res.send(`Welcome ${req.user.displayName}`);
});

/**
 * @description Google auth failure
 * @method      GET /api/v1/auth/google/failure
 * @access      Public
 */
module.exports.failure = asyncHandler(async (req, res) => {
	res.status(400).send('Authentication error');
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
	req.session = null;
	req.logOut();
	res.redirect('/');
	res.status(400).send('Authentication error');
});
