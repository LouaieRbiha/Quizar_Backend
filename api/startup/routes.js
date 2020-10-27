const express = require('express');
const cookieParser = require('cookie-parser');
const error = require('../middlewares/error');

module.exports = (app) => {
	// Body parser
	app.use(express.json());

	// Cookie Parser
	app.use(cookieParser());

	// Error middleware
	app.use(error);
};
