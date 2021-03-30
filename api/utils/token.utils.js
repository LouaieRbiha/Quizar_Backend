/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const config = require('config');
const geoip = require('geoip-lite');
const asyncHandler = require('../middlewares/async');
const { Token } = require('../models/Token');
const { User } = require('../models/User');

const options = {
	httpOnly: true, // client can't get cookie by script
	secure: true, // only transfer over https
	sameSite: true, // only sent for requests to the same FQDN as the domain in the cookie
};

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

	const user = await User.findById(req.user._id);
	if (!user) return next(new ErrorResponse(`Ressource not found with id ${req.user._id}`, 404));

	const userToken = { id: req.user._id, version: user.tokenVersion };

	const refreshToken = await jwt.sign(userToken, config.get('JWT.REFRESH_TOKEN.SECRET'), {
		expiresIn: config.get('JWT.REFRESH_TOKEN.EXPIRE'),
	});
	res.cookie('jidr', refreshToken, { ...options, maxAge: 1000 * 3600 * 24 * 7 });

	const accessToken = await jwt.sign(userToken, config.get('JWT.ACCESS_TOKEN.SECRET'), {
		expiresIn: config.get('JWT.ACCESS_TOKEN.EXPIRE'),
	});

	res.cookie('jida', accessToken, { ...options, maxAge: 1000 * 60 * 15 });
	// res.setHeader('x-auth-token', accessToken);

	const auth = {
		accessToken,
		refreshToken,
		expiresIn: new Date().setTime(new Date().getTime() + 1000 * 60 * 15),
	};

	return auth;
};

const generateToken = asyncHandler(async (req, res, next) => {
	req.auth = await createToken(req, res);
	return next();
});

const sendToken = asyncHandler(async (req, res) => {
	return res.status(200).json(req.auth);
});

const redirect = asyncHandler(async (req, res) => {
	return res.status(200).redirect('http://localhost:4200/dashboard/');
});

module.exports.generateToken = generateToken;
module.exports.sendToken = sendToken;
module.exports.redirect = redirect;
