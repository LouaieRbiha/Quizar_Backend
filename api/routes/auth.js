const express = require('express');

const router = express.Router();
const { authenticate, callback, success, failure, me, logout } = require('../controllers/auth');

const requireLogin = require('../middlewares/requireLogin');

router.route('/google').get(authenticate);
router.route('/google/callback').get(callback);
router.route('/google/success').get(requireLogin, success);
router.route('/google/failure').get(failure);

router.route('/me').get(requireLogin, me);

router.route('/logout').get(requireLogin, logout);

module.exports = router;
