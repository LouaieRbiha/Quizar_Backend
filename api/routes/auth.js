const express = require('express');
const { generateToken, sendToken } = require('../utils/token.utils');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();
const {
	signupLocal,
	signinLocal,
	forgotPassword,
	resetPassword,

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
router.route('/forgotPassword').patch(forgotPassword);
router.route('/resetPassword/:resetPasswordToken').patch(resetPassword);

// Google
router.route('/google').get(authenticateGoogle);
router.route('/google/callback').get(callbackGoogle, generateToken, sendToken);

// LinkedIn
router.route('/linkedin').get(authenticateLinkedin);
router.route('/linkedin/callback').get(callbackLinkedin, generateToken, sendToken);

// Others
router.route('/me').get(protect, getMe);
router.route('/logout').get(protect, logout);

module.exports = router;
