const winston = require('winston');
const mongoose = require('mongoose');
const config = require('config');

module.exports = async () => {
	const db = config.get('DB');

	mongoose.set('runValidators', true);

	mongoose
		.connect(db, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
		})
		.then((conn) => {
			winston.info(`MongoDB Connected : ${conn.connection.host}`);
		})
		.catch((err) => {
			winston.error('Error occured while connecting to mongoDB', err.message);
		});
};
