const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { User, validate } = require('../models/User');

/**
 * @description Get all users
 * @method      GET /api/v1/users
 * @access      Private [admin]
 */
module.exports.getUsers = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

/**
 * @description Get a single user
 * @method      GET /api/v1/users/:id
 * @access      Private [admin]
 */
module.exports.getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!user) return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	res.status(200).json({
		data: user,
	});
});

/**
 * @description Update a single user
 * @method      PUT /api/v1/users/:id
 * @access      Private [admin]
 */
module.exports.updateUser = asyncHandler(async (req, res, next) => {
	const { error } = validate(req.body);
	if (error) return next(new ErrorResponse(error.details[0].message, 400));

	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!user) return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	res.status(200).json({
		data: user,
	});
});

/**
 * @description Update multiple users
 * @method      PATCH /api/v1/users
 * @access      Private [admin]
 */
module.exports.updateUsers = asyncHandler(async (req, res, next) => {
	await User.updateMany({}, { $set: req.body });

	res.status(200).json({ success: true });
});

/**
 * @description Delete a single user
 * @method      DELETE /api/v1/users/:id
 * @access      Private [admin]
 */
module.exports.deleteUser = asyncHandler(async (req, res, next) => {
	const user = await User.findByIdAndDelete(req.params.id);
	if (!user) return next(new ErrorResponse(`Ressource not found with id ${req.params.id}.`, 400));

	res.status(200).json({
		data: {},
	});
});

/**
 * @description Delete multiple users
 * @method      DELETE /api/v1/users
 * @access      Private [admin]
 */
module.exports.deleteUsers = asyncHandler(async (req, res, next) => {
	await User.deleteMany({});
	res.status(200).json({
		data: {},
	});
});
