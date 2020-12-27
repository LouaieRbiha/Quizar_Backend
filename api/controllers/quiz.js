const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { Quiz, validate } = require('../models/Quiz');
const { User } = require('../models/User');

/**
 * @description Add new quiz
 * @method      POST /api/v1/quiz/
 * @access      Private [admin, examiner]
 */
module.exports.addQuiz = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.user.id);
	if (!user) return next(new ErrorResponse(`Ressource not found with id ${req.user.id}`, 400));

	req.body.user = req.user.id;

	const { error } = validate(req.body);
	if (error) return next(new ErrorResponse(error.details[0].message, 400));

	const quiz = await Quiz.create(req.body);
	await quiz
		.populate({
			path: 'user',
			select: 'firstname lastname',
		})
		.execPopulate();

	res.status(201).json({
		data: quiz,
	});
});

/**
 * @description Get all quizzes
 * @method      GET [/api/v1/quiz/, /api/v1/users/:id/quiz]
 * @access      Private [admin, examiner]
 */
module.exports.getQuizzes = asyncHandler(async (req, res, next) => {
	if (req.params.id) {
		const quizzes = await Quiz.find({ user: req.params.id });

		return res.status(200).json({
			count: quizzes.length,
			data: quizzes,
		});
	}
	if (req.user.role !== 'admin')
		return next(
			new ErrorResponse(`User with id ${req.user.id} is unauthorized to access this route.`, 401),
		);
	res.status(200).json(res.advancedResults);
});

/**
 * @description Get a single quiz
 * @method      GET /api/v1/quiz/:id
 * @access      Private [admin, examiner]
 */
module.exports.getQuiz = asyncHandler(async (req, res, next) => {
	const quiz = await Quiz.findById(req.params.id).populate({
		path: 'user',
		select: 'firstname lastname',
	});
	if (!quiz) return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	res.status(200).json({
		data: quiz,
	});
});

/**
 * @description Update a single quiz
 * @method      PUT /api/v1/quiz/:id
 * @access      Private [admin, examiner]
 */
module.exports.updateQuiz = asyncHandler(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new ErrorResponse(error.details[0].message, 400));

	const quiz = await Quiz.findById(req.params.id);
	if (!quiz) return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	if (quiz.user.toString() !== req.user.id.toString())
		return next(
			// eslint-disable-next-line no-underscore-dangle
			new ErrorResponse(`User ${req.user.id} is not authorized to update course ${quiz._id}`, 401),
		);

	const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
	res.status(200).json({
		data: updatedQuiz,
	});
});

/**
 * @description Update multiple quizzes
 * @method      PATCH /api/v1/quiz/
 * @access      Private [admin]
 */
module.exports.updateQuizzes = asyncHandler(async (req, res, next) => {
	await Quiz.updateMany({}, { $set: req.body });

	res.status(200).json({ success: true });
});

/**
 * @description Delete a single quiz
 * @method      DELETE /api/v1/quiz/:id
 * @access      Private [admin, examiner]
 */
module.exports.deleteQuiz = asyncHandler(async (req, res, next) => {
	const quiz = await Quiz.findById(req.params.id);
	if (!quiz) return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	if (quiz.user.toString() !== req.user.id.toString())
		return next(
			// eslint-disable-next-line no-underscore-dangle
			new ErrorResponse(`User ${req.user.id} is not authorized to update course ${quiz._id}`, 401),
		);

	await quiz.remove();

	res.status(200).json({
		data: {},
	});
});

/**
 * @description Delete multiple quizzes
 * @method      DELETE /api/v1/quiz
 * @access      Private [admin]
 */
module.exports.deleteQuizzes = asyncHandler(async (req, res, next) => {
	await Quiz.deleteMany({});
	res.status(200).json({
		data: {},
	});
});
