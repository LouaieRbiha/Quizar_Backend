const jwt = require('jsonwebtoken');
const config = require('config');
const { Token } = require('../models/Token');
const { Blacklist } = require('../models/Blacklist');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('./async');

// Authenticate tokens for protected routes
module.exports.protect = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	const token = authHeader && authHeader.split(' ')[1];
	console.log('token');

	// eslint-disable-next-line security/detect-possible-timing-attacks
	if (token === null) return res.sendStatus(401);

	const found = await Blacklist.findOne({ token });

	if (found) {
		const details = {
			Status: 'Failure',
			Details: 'Token blacklisted. Cannot use this token.',
		};

		return res.status(401).json(details);
	}

	jwt.verify(token, config.get('JWT_SECRET'), async (err, payload) => {
		if (err) return res.sendStatus(403);
		if (payload) {
			const login = await Token.findOne({
				where: { user_id: payload.id, token_id: payload.token_id },
			});
			if (login.token_deleted === true) {
				await Blacklist.create({
					token,
				});
				return res.sendStatus(401);
			}
		}
		req.user = payload;
		next();
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
