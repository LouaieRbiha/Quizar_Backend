const express = require('express');
const passport = require('passport');
const config = require('config');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const auth = require('../routes/auth');
const error = require('../middlewares/error');

module.exports = (app) => {
	// Body parser
	app.use(express.json());

	// Cookie Parser
	app.use(cookieParser());

	// Error middleware
	app.use(error);

	// Passport & session middlewares
	app.use(
		cookieSession({
			name: 'test-session',
			maxAge: 30 * 24 * 60 * 60 * 1000,
			keys: [config.get('OAuth.COOKIE_KEY')],
		}),
	);
	app.use(passport.initialize());
	app.use(passport.session());

	// Routes
	app.use('/api/v1/auth', auth);
};
