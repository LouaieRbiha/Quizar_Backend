const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const auth = require('../routes/auth');
const error = require('../middlewares/error');

module.exports = (app) => {
	// Body parser
	app.use(express.json());

	// Cookie Parser
	app.use(cookieParser());

	// Error middleware
	app.use(error);

	// Init passport
	app.use(passport.initialize());

	// Routes
	app.use('/api/v1/auth', auth);
};
