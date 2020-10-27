const winston = require('winston');
const morgan = require('morgan');

module.exports = (app) => {
	winston.exceptions.handle(
		new winston.transports.Console({ colorize: true, prettyPrint: true }),
		new winston.transports.File({ filename: 'uncaughtExceptions.log' }),
	);

	// Handle unhandled promise rejections
	process.on('unhandledRejection', (ex) => {
		throw ex;
	});

	winston.add(new winston.transports.File({ filename: 'logfile.log' }));

	//! Dev logging middleware, in dev only
	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	}
};
