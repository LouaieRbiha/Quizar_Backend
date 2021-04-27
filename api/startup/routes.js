const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const auth = require('../routes/auth');
const tokens = require('../routes/tokens');
const users = require('../routes/users');
const quiz = require('../routes/quiz');
const submissions = require('../routes/submissions');
const error = require('../middlewares/error');
const errorHandler = require('../middlewares/error');


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
	app.use('/api/v1/tokens', tokens);
	app.use('/api/v1/users', users);
	app.use('/api/v1/quiz', quiz);
	app.use('/api/v1/submissions', submissions);

	app.use(errorHandler);
};
