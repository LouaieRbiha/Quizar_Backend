const mongoose = require('mongoose');
const Joi = require('joi');

const AnswerSchema = new mongoose.Schema(
	{
		number: {
			type: Number,
		},
		answer: {
			type: String,
			required: [true, 'Please add an answer'],
			minlength: 1,
			maxlength: 200,
			trim: true,
			lowercase: true,
		},
		isCorrect: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{
		_id: false,
	},
);

function validateAnswer(answer) {
	const schema = Joi.object({
		answer: Joi.objectId().required(),
		isCorrect: Joi.boolean().required(),
	});

	return schema.validate(answer);
}

module.exports.validate = validateAnswer;
module.exports.Answer = mongoose.model('Answer', AnswerSchema);
