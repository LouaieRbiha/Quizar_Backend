const jwt = require('jsonwebtoken');

const config = require('config');
const { Blacklist } = require('../models/Blacklist');
const { Token } = require('../models/Token');
const asyncHandler = require('./async');

module.exports.blacklistToken = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (token === null) return res.sendStatus(401);

	const found = await Blacklist.findOne({ token });
	if (found) {
		jwt.verify(token, config.get('JWT_SECRET'), async (err, payload) => {
			const login = await Token.findOne({
				user_id: payload.id,
				token_id: payload.token_id,
			});
			login.logged_out = true;
			login.token_deleted = true;
			await login.save();
		});
		details = {
			Status: 'Failure',
			Details: 'Token blacklisted. Cannot use this token.',
		};

		return res.status(401).json(details);
	}

	jwt.verify(token, config.get('JWT_SECRET'), async (err, payload) => {
		if (err) return res.sendStatus(403);
		if (payload) {
			const login = await Token.findOne({ user_id: payload.id, token_id: payload.token_id });
			if (login.token_deleted === true) {
				login.logged_out = true;
				await login.save();
				await Blacklist.create({
					token,
				});
			} else {
				login.logged_out = true;
				login.token_deleted = true;
				await login.save();
				await Blacklist.create({
					token,
				});
			}
		}
		next();
	});
});
