const mongoose = require('mongoose');
const Joi = require('joi');

const QuestionSchema = new mongoose.Schema({
	question: {
		type: String,
		required: [true, 'Please add a question'],
		minlength: 10,
		maxlength: 1000,
		trim: true,
		lowercase: true,
		document: [{ type: String }],
	},
	answer: {
		type: [mongoose.Schema.ObjectId],
		ref: 'Answer',
		required: true,
		default: undefined,
		validate: {
			validator: (value) => {
				return value && value.length >= 2 && value.length <= 4;
			},
			message: 'Answer options should be in [2,4] range',
		},
	},
	point: {
		type: Number,
		default: 1,
	},
});

function validateQuestion(question) {
	const schema = Joi.object({
		question: Joi.objectId().required(),
		answer: Joi.array().objectId().required(),
	});

	return schema.validate(question);
}

module.exports.validate = validateQuestion;
module.exports.Question = mongoose.model('Question', QuestionSchema);
