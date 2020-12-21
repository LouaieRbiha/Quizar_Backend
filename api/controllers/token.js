/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { User } = require('../models/User');
const { Token } = require('../models/Token');

// eslint-disable-next-line import/order
const { ObjectId } = require('mongoose').Types;

require('../../config/passportLocal');
require('../../config/passportGoogle');
require('../../config/passportLinkedin');

/**
 * @description Get loggedIn user's tokens
 * @method      GET /api/v1/tokens
 * @access      Private[admin, candidate]
 */
module.exports.getTokens = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	if (!user) return next(new ErrorResponse('Bad Request', 400));

	let current;

	const tokens = await Token.find({
		user: user._id,
		token_deleted: false,
	});
	tokens.forEach((t) => {
		if (req.token === t._id.toString()) {
			current = t;
		}
	});
	return res.status(200).send({ tokens, current });
});

/**
 * @description Update loggedIn user's token by id
 * 				[token_deleted] proprety is set to true
 * @method      GET /api/v1/tokens/:id
 * @access      Private [admin, candidate]
 */
module.exports.updateTokenById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	if (!user) return next(new ErrorResponse('Bad Request', 400));

	const token = await Token.findOne({
		_id: req.params.id,
	});

	if (!token)
		return next(new ErrorResponse(`Ressource not found with id of ${req.params.id}`, 404));

	token.token_deleted = true;
	await token.save();

	return res.status(200).send({ deleted: true, token });
});

/**
 * @description Update loggedIn user's tokens minus the current one => logout from other devices
 * 				[token_deleted, logged_out] propreties are set to true
 * @method      GET /api/v1/tokens/notCurrent
 * @access      Private[admin, candidate]
 */
module.exports.updateNotCurrent = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	if (!user) return next(new ErrorResponse('Bad Request', 400));

	let current;

	const tokens = await Token.find({
		user: new ObjectId(user._id),
		token_deleted: false,
	});
	tokens.forEach((t) => {
		if (req.token === t._id.toString()) {
			current = t;
		} else {
			t.token_deleted = true;
			t.logged_out = true;
			t.save();
		}
	});
	return res.status(200).send({ deleted: true, tokens, current });
});

/**
 * @description Update Token by userId & tokenId
 * 				[token_deleted] proprety is set to true
 * @method      PATCH /api/v1/tokens/:userId/:id
 * @access      Private [admin, candidate]
 */
module.exports.updateToken = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.userId);
	if (!user)
		return next(new ErrorResponse(`Ressource not found with id of ${req.params.userId}`, 404));

	if (req.params.id !== '') {
		const token = await Token.findOne({
			_id: req.params.id,
			user: ObjectId(req.params.userId),
		});

		if (!token)
			return next(new ErrorResponse(`Ressource not found with id of ${req.params.id}`, 404));

		token.token_deleted = true;
		await token.save();

		return res.status(200).send({ deleted: true, token });
	}

	const tokens = await Token.updateMany(
		{ user: { $eq: ObjectId(req.params.userId) } },
		{ $set: { token_deleted: true } },
	);
	if (!tokens) return next(new ErrorResponse(`Ressource not found`, 404));

	return res.status(200).json({ deleted: true, tokens });
});

/**
 * @description Update all loggedIn user's tokens => logout from all devices
 * 				[token_deleted, logged_out] propreties are set to true
 * @method      GET /api/v1/tokens/all
 * @access      Private[admin, candidate]
 */
module.exports.updateAll = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user.id);
	if (!user) return next(new ErrorResponse('Bad Request', 400));

	const tokens = await Token.find({
		user: user._id,
		token_deleted: false,
	});

	tokens.forEach((t) => {
		t.token_deleted = true;
		t.logged_out = true;
		t.save();
	});
	return res.status(200).send({ deleted: true });
});
