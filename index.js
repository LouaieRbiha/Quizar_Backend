const express = require('express');
const config = require('config');
const winston = require('winston');

const app = express();

require('./api/startup/logging')(app);
require('./api/startup/security')(app);
require('./api/startup/routes')(app);
require('./api/startup/db')();
require('./api/startup/config')();

app.get('/', (req, res) => {
	const localTime = new Date().toLocaleDateString();

	res.header('Content-Type', 'application/json');

	res.status(200).json({
		message: `Server time is ${localTime}.`,
		headers: JSON.stringify(req.headers),
		ip: JSON.stringify(req.ip),
		browser: req.headers['user-agent'],
		language: req.headers['accept-language'],
	});
});

const PORT = config.get('PORT') || process.env.PORT;

const server = app.listen(PORT, winston.info(`Server running on port ${PORT}`));

module.exports = server;
