/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const config = require('config');

const { Blacklist } = require('../models/Blacklist');
const { User } = require('../models/User');

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	const bearer = authHeader && authHeader.split(' ')[0];
	const token = authHeader && authHeader.split(' ')[1];

	if (bearer !== 'Bearer' || token === null) return res.sendStatus(401);

	Blacklist.findOne({ where: { token } }).then((found) => {
		if (found) {
			details = {
				Status: 'Failure',
				Details: 'Token blacklisted. Cannot use this token.',
			};

			return res.status(401).json(details);
		}
		jwt.verify(token, config.get('JWT_SECRET'), async (err, payload) => {
			if (err) return res.sendStatus(403);
			if (payload) {
				const user = await User.findOne({
					where: { _id: payload._id, token_id: payload.token_id }, // must add token_id with (agent, ip addr and location)
				});
				if (user.token_deleted === true) {
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
};

module.exports = authenticateToken;
