const mongoose = require('mongoose');
const Joi = require('joi');

const StatisticSchema = new mongoose.Schema({});

function validateStatistic(statistic) {
	const schema = Joi.object({});

	return schema.validate(statistic);
}

module.exports.validate = validateStatistic;
module.exports.Statistic = mongoose.model('Statistic', StatisticSchema);
