const mongoose = require('mongoose');
const Joi = require('joi');

const BlacklistSchema = new mongoose.Schema(
	{
		token: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 1024,
		},
	},
	{
		timestamps: true,
		// _id: false,
	},
);

function validateBlacklist(blacklist) {
	const schema = Joi.object({
		token: Joi.string().min(3).max(1024).required(),
	});

	return schema.validate(blacklist);
}

module.exports.validate = validateBlacklist;
module.exports.Blacklist = mongoose.model('Blacklist', BlacklistSchema);
