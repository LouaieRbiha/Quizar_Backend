const jwt = require('jsonwebtoken');
const customId = require('custom-id');
const config = require('config');
const geoip = require('geoip-lite');
const asyncHandler = require('../middlewares/async');
const { Token } = require('../models/Token');

const createToken = async (req) => {
	const ip =
		(req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;

	const userLogin = await Token.find({
		where: {
			user: req.auth.id,
			token_deleted: false,
			ip_address: ip,
			device: req.headers['user-agent'],
		},
	});
	userLogin.forEach(async (login) => {
		if (login) {
			// eslint-disable-next-line no-param-reassign
			login.token_deleted = true;
			await login.save();
		}
	});

	const tokenSecret = await customId({
		token_secret: ip,
		date: Date.now(),
		randomLength: 8,
	});

	const token = await Token.create({
		user: req.auth.id,
		token_secret: tokenSecret,
		ip_address: ip,
		device: req.headers['user-agent'],
		geo: geoip.lookup(ip),
	});

	// eslint-disable-next-line no-underscore-dangle
	const tokenUser = { id: req.auth.id, token_id: token._id };
	const accessToken = await jwt.sign(tokenUser, config.get('JWT_SECRET'));
	return accessToken;
};

const generateToken = asyncHandler(async (req, res, next) => {
	req.token = await createToken(req);
	return next();
});

const sendToken = asyncHandler(async (req, res) => {
	if (req.auth.register === false) {
		message = 'user found & logged in';
	} else {
		message = 'user created';
	}
	const accessToken = { auth: true, token: req.token, message };

	res.setHeader('x-auth-token', req.token);
	return res.status(200).json(accessToken);
});

module.exports.generateToken = generateToken;
module.exports.sendToken = sendToken;
