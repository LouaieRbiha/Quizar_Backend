const express = require('express');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');
const { User } = require('../models/User');
const {
	getUsers,
	getUser,
	updateUser,
	updateUsers,
	deleteUser,
	deleteUsers,
} = require('../controllers/user');

const router = express.Router();

// Include other ressource routers
const quizRouter = require('./quiz');
const submissionRouter = require('./submissions');

router.use(protect);

// Re-route into other ressource routers
router.use('/:id/quiz', quizRouter);
router.use('/:userId/submissions', submissionRouter);

router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).patch(updateUsers).delete(deleteUsers);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
