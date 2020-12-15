const express = require('express');
const passport = require('passport');
require('../utils/passportLocal');

const router = express.Router();
const {
	signinLocal,
	signupLocal,
	secureLocal,
	authenticateGoogle,
	callback,
	success,
	failure,
	authenticateLinkedin,
	callbackLinkedin,
	me,
	logout,
} = require('../controllers/auth');

const requireLogin = require('../middlewares/authenticateToken');

// Local
router.route('/signin').post(signinLocal);
router.route('/signup').post(signupLocal);

// Plug in the JWT strategy as a middleware so only verified users can access this route.
// router.route('/secure').get(passport.authenticate('jwt', { session: false }), secureLocal);

// Google
router.route('/google').get(authenticateGoogle);
router.route('/google/callback').get(callback);

// LinkedIn
router.route('/linkedin').get(authenticateLinkedin);
router.route('/linkedin/callback').get(callbackLinkedin);

// Others
router.route('/me').get(me); // must check if logged in (middleware)
router.route('/logout').get(logout); // must check if logged in (middleware)

module.exports = router;
