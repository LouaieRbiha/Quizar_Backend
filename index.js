const express = require('express');
const config = require('config');
const winston = require('winston');

const app = express();

require('./api/startup/logging')(app);
require('./api/startup/security')(app);
require('./api/startup/routes')(app);
require('./api/startup/db')();
require('./api/startup/config')();

const PORT = config.get('port') || process.env.PORT;

const server = app.listen(PORT, winston.info(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
	res.status(200).send('Hello !');
});

module.exports = server;
