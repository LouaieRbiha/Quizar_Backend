const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

const morgan = require('morgan');
const debug = require('debug')('express');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

dotenv.config({
	path: './config/.env',
});

const app = express();

// Body parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// To remove prohibited data
app.use(mongoSanitize());

// Security headers
app.use(helmet());

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

// Provide a Connect/Express middleware
app.use(cors());

// Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	debug(`Unhandled promise rejection error : ${err.message}`);

	// close server & exit process
	server.close(() => {
		process.exit(1); // exit with failure
	});
});

app.get('/', (req, res, next) => {
	debug('LOL');
	console.log('test');
});
