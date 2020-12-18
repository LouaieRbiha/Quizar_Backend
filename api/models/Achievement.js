const mongoose = require('mongoose');
const Joi = require('joi');

const AchievementSchema = new mongoose.Schema({});

function validateAchievement(achievement) {
	const schema = Joi.object({});

	return schema.validate(achievement);
}

module.exports.validate = validateAchievement;
module.exports.Achievement = mongoose.model('Achievement', AchievementSchema);
