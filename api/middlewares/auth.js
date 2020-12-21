const jwt = require('jsonwebtoken');
const config = require('config');
const { Token } = require('../models/Token');
const { Blacklist } = require('../models/Blacklist');
const { User } = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');
// eslint-disable-next-line import/order
const { ObjectId } = require('mongoose').Types;

// Authenticate tokens for protected routes
module.exports.protect = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) return next(new ErrorResponse('Unauthorized token', 401));

	const found = await Blacklist.findOne({ token });
	if (found) return next(new ErrorResponse('Unauthorized token', 401));

	const payload = jwt.verify(token, config.get('JWT_SECRET'));

	const login = await Token.findOne({
		user: ObjectId(payload.id),
		_id: ObjectId(payload.token_id),
	});

	if (login.token_deleted === true) {
		await Blacklist.create({
			token,
		});
		return next(new ErrorResponse('Unauthorized token', 401));
	}

	req.user = await User.findById(payload.id);
	req.token = payload.token_id;
	next();
});

// Grant access to specific roles
module.exports.authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403),
			);
		}
		next();
	};
};
