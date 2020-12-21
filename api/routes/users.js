const express = require('express');
const {
	getUsers,
	getUser,
	updateUser,
	updateUsers,
	deleteUser,
	deleteUsers,
} = require('../controllers/user');

const { User } = require('../models/User');

const router = express.Router();

const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).patch(updateUsers).delete(deleteUsers);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
