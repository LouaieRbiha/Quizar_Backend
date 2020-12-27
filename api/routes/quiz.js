const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const advancedResults = require('../middlewares/advancedResults');
const { Quiz } = require('../models/Quiz');
const {
	getQuizzes,
	getQuiz,
	updateQuiz,
	updateQuizzes,
	deleteQuiz,
	deleteQuizzes,
	addQuiz,
} = require('../controllers/quiz');

const router = express.Router({ mergeParams: true });

// Include other ressource routers
const submissionRouter = require('./submissions');

router.use(protect);

// Re-route into other ressource routers
router.use('/:id/submissions', submissionRouter);
router.use('/:quizId/submissions', submissionRouter);

router.use(authorize('admin', 'examiner'));

router
	.route('/')
	.get(
		advancedResults(Quiz, {
			path: 'user',
			select: 'firstname lastname',
		}),
		getQuizzes,
	)
	.post(addQuiz)
	.patch(authorize('admin'), updateQuizzes)
	.delete(authorize('admin'), deleteQuizzes);

router.route('/:id').get(getQuiz).put(updateQuiz).delete(deleteQuiz);

module.exports = router;
