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
	res.status(200).json({ message: `Server time is ${localTime}.` });
});

const PORT = config.get('PORT') || process.env.PORT;

const server = app.listen(PORT, winston.info(`Server running on port ${PORT}`));

module.exports = server;
