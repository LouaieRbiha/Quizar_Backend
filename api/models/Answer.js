const mongoose = require('mongoose');

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
			default: false,
		},
	},
	{
		_id: false,
	},
);

module.exports.Answer = mongoose.model('Answer', AnswerSchema);
