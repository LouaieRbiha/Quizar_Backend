const express = require('express');
const advancedResults = require('../middlewares/advancedResults');
const { protect, authorize } = require('../middlewares/auth');
const { Submission } = require('../models/Submission');
const {
	getSubmissions,
	getSubmission,
	updateSubmission,
	updateSubmissions,
	deleteSubmission,
	addSubmission,
} = require('../controllers/submission');

const router = express.Router({ mergeParams: true });

router.use(protect);
router.use(authorize('admin'));

router
	.route('/')
	.get(
		authorize('admin', 'examiner', 'examinee', 'recruiter'),
		advancedResults(Submission, {
			path: 'user',
			select: 'firstname lastname',
		}),
		getSubmissions,
	)
	.post(authorize('admin', 'examinee'), addSubmission)
	.patch(updateSubmissions);

router
	.route('/:id')
	.get(authorize('admin', 'examinee', 'recruiter'), getSubmission)
	.put(updateSubmission)
	.delete(deleteSubmission);

module.exports = router;
