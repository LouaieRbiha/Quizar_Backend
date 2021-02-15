/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const config = require('config');
const geoip = require('geoip-lite');
const asyncHandler = require('../middlewares/async');
const { Token } = require('../models/Token');
const { User } = require('../models/User');

const createToken = async (req, res) => {
	const ip =
		(req.headers['x-forwarded-for'] || '').split(',').pop().trim() ||
		req.connection.remoteAddress ||
		req.socket.remoteAddress ||
		req.connection.socket.remoteAddress;

	const userLogin = await Token.find({
		user: req.user.id,
		token_deleted: false,
		ip_address: ip,
		device: req.headers['user-agent'],
	});

	userLogin.forEach(async (login) => {
		if (login) {
			// eslint-disable-next-line no-param-reassign
			login.token_deleted = true;
			await login.save();
		}
	});

	await Token.create({
		user: req.user._id,
		ip_address: ip,
		device: req.headers['user-agent'],
		geo: geoip.lookup(ip),
	});

	console.log(req.user.tokenVersion);
	const user = await User.findById(req.user._id);
	if (!user) return next(new ErrorResponse(`Ressource not found with id ${req.user._id}`, 404));

	const userToken = { id: req.user._id, version: user.tokenVersion };

	const refreshToken = await jwt.sign(userToken, config.get('JWT.REFRESH_TOKEN.SECRET'), {
		expiresIn: config.get('JWT.REFRESH_TOKEN.EXPIRE'),
	});
	res.cookie('jid', refreshToken, { httpOnly: true });

	const accessToken = await jwt.sign(userToken, config.get('JWT.ACCESS_TOKEN.SECRET'), {
		expiresIn: config.get('JWT.ACCESS_TOKEN.EXPIRE'),
	});

	// console.log('Utils: refreshToken :>> ', refreshToken);
	// console.log('Utils: accessToken :>> ', accessToken);
	return accessToken;
};

const generateToken = asyncHandler(async (req, res, next) => {
	req.token = await createToken(req, res);
	return next();
});

const sendToken = asyncHandler(async (req, res) => {
	const accessToken = { token: req.token };
	res.setHeader('x-auth-token', req.token);

	return res.status(200).json(accessToken);
});

module.exports.generateToken = generateToken;
module.exports.sendToken = sendToken;
