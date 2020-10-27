const express = require('express');
const config = require('config');
const winston = require('winston');

const app = express();

require('./api/startup/logging')(app);
require('./api/startup/security')(app);
require('./api/startup/routes')(app);
require('./api/startup/db')();
require('./api/startup/config')();

const PORT = config.get('port') || 3000;

const server = app.listen(PORT, winston.info(`Server running on port ${PORT}`));

module.exports = server;
