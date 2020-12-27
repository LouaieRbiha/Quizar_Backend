const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Submission, validate } = require('../models/Submission');
const { User } = require('../models/User');
const { Quiz } = require('../models/Quiz');

/**
 * @description Add new submission
 * @method      POST /api/v1/quiz/:id/submissions/
 * @access      Private [admin, examinee]
 */
module.exports.addSubmission = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	if (!user) return next(new ErrorResponse(`Ressource not found with id ${req.user.id}`, 400));

	const quiz = await Quiz.findById(req.params.id);
	if (!quiz) return next(new ErrorResponse(`Ressource not found with id ${req.params.id}`, 400));

	req.body.user = req.user.id;

	const { error } = validate(req.body);
	if (error) return next(new ErrorResponse(error.details[0].message, 400));

	const submission = await Submission.create(req.body);
	await submission
		.populate({
			path: 'user',
			select: 'firstname lastname',
		})
		.populate({
			path: 'quiz',
			selecte: 'title tags',
		})
		.execPopulate();

	res.status(201).json({
		data: submission,
	});
});

/**
 * @description Get all submissions
 * @method      GET [/api/v1/submissions/, /api/v1/users/:userId/submissions, /api/v1/quiz/:quizId/submissions]
 * @access      Private [admin, examinee, recruiter, examiner]
 */
module.exports.getSubmissions = asyncHandler(async (req, res, next) => {
	/**
	 * return user's submissions only if [recruiter, examinee]
	 * return quiz submissions only if [examiner, admin, recruiter]
	 * return all submissions only if [admin]
	 */

	let query;
	if (req.params.userId || req.params.quizId) {
		if (
			(req.params.userId && req.user.role === 'examinee' && req.user.id === req.params.userId) ||
			req.user.role === 'recruiter'
		)
			// search submissions by user id
			query = { user: req.params.userId };
		else if (
			req.params.quizId &&
			(req.user.role === 'admin' || req.user.role === 'examiner' || req.user.role === 'recruiter')
		)
			// search submissions by quiz id
			query = { quiz: req.params.quizId };

		const submissions = await Submission.find(query)
			.populate({
				path: 'user',
				select: 'firstname lastname',
			})
			.populate({
				path: 'quiz',
				select: 'title tags',
			});

		return res.status(200).json({
			count: submissions.length,
			data: submissions,
		});
	}

	if (req.user.role !== 'admin')
		return next(
			new ErrorResponse(`User with id ${req.user.id} is unauthorized to access this route.`, 401),
		);

	// check middleware populate
	res.status(200).json(res.advancedResults);
});

/**
 * @description Get a single submission
 * @method      GET /api/v1/submissions/:id
 * @access      Private [admin, examinee, recruiter]
 */
module.exports.getSubmission = asyncHandler(async (req, res, next) => {
	const submission = await Submission.findById(req.params.id)
		.populate({
			path: 'user',
			select: 'firstname lastname',
		})
		.populate({
			path: 'quiz',
			select: 'title tags',
		});

	if (!submission)
		return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	res.status(200).json({
		data: submission,
	});
});

/**
 * @description Update a single submission
 * @method      PUT /api/v1/submission/:id
 * @access      Private [admin]
 */
module.exports.updateSubmission = asyncHandler(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new ErrorResponse(error.details[0].message, 400));

	const submission = await Submission.findById(req.params.id);
	if (!submission)
		return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	const updatedSubmission = await Submission.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
	});

	res.status(200).json({
		data: updatedSubmission,
	});
});

/**
 * @description Update multiple submissions
 * @method      PATCH /api/v1/submissions/
 * @access      Private [admin]
 */
module.exports.updateSubmissions = asyncHandler(async (req, res) => {
	await Submission.updateMany({}, { $set: req.body });

	res.status(200).json({ success: true });
});

/**
 * @description Delete a single submission
 * @method      DELETE /api/v1/submission/:id
 * @access      Private [admin]
 */
module.exports.deleteSubmission = asyncHandler(async (req, res, next) => {
	const submission = await Submission.findById(req.params.id);
	if (!submission)
		return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	await submission.remove();

	res.status(200).json({
		data: {},
	});
});

/**
 * @description Delete multiple submissions
 * @method      DELETE /api/v1/submission
 * @access      Private [admin]
 */
module.exports.deleteQuizzes = asyncHandler(async (req, res) => {
	await Submission.deleteMany({});

	res.status(200).json({
		data: {},
	});
});
