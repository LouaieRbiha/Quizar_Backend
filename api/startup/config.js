const config = require('config');
const express = require('express');
const path = require('path');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = (app) => {
	// Required env variables
	if (!config.get('SECRET')) throw new Error('FATAL ERROR: env var is not defined.');

	// Set static folder
	app.use(express.static(path.join(__dirname, 'public')));
};

module.exports = function () {};
