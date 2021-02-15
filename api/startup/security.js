const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

module.exports = (app) => {
	// Provide a Connect/Express middleware
	const corsOptions = {
		origin: '*',
		'Access-Control-Allow-Origin': '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
		optionsSuccessStatus: 204,
		credentials: true,
		exposeHeaders: ['x-auth-token'],
	};

	app.use(cors(corsOptions));

	// Security headers
	app.use(helmet());

	// Compress response sent to client
	app.use(compression());

	// Prevent XSS attacks
	app.use(xss());

	const limiter = rateLimit({
		windowMs: 10 * 60 * 1000, // 10 minutes
		max: 100, // limit each IP to 100 requests per windowMs
	});

	// apply limit to all requests
	app.use(limiter);

	// protect against HTTP Parameter Pollution attacks
	app.use(hpp());

	// To remove prohibited data
	app.use(mongoSanitize());
};
