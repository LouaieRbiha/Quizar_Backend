const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

// Authenticate tokens for protected routes
module.exports.protect = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return next(new ErrorResponse('Unauthorized token', 401));

	jwt.verify(token, config.get('JWT.ACCESS_TOKEN.SECRET'), async (err, payload) => {
		if (err) return next(new ErrorResponse('Unauthorized token', 401));
		if (payload) {
			const user = await User.findById(payload.id);
			if (!user) return next(new ErrorResponse(`Ressource not found with id ${payload.id}`, 401));

			req.user = user;
			next();
		}
	});
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
