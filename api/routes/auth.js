const express = require('express');
const { generateToken, sendToken } = require('../utils/token.utils');
const { blacklistToken } = require('../middlewares/blacklistToken');

const router = express.Router();
const {
	signupLocal,
	signinLocal,

	authenticateGoogle,
	callbackGoogle,

	authenticateLinkedin,
	callbackLinkedin,

	getMe,
	logout,
} = require('../controllers/auth');

// Local
router.route('/signin').post(signinLocal, generateToken, sendToken);
router.route('/signup').post(signupLocal);

// Google
router.route('/google').get(authenticateGoogle);
router.route('/google/callback').get(callbackGoogle, generateToken, sendToken);

// LinkedIn
router.route('/linkedin').get(authenticateLinkedin);
router.route('/linkedin/callback').get(callbackLinkedin, generateToken, sendToken);

// Others
router.route('/me').get(getMe); // must check if logged in (middleware)
router.route('/logout').get(blacklistToken, logout);

module.exports = router;
