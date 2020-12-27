const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const AnswerSchema = new mongoose.Schema(
	{
		number: {
			type: Number,
			default: 1,
		},
		answer: {
			type: String,
			required: [true, 'Please add an answer'],
			minlength: 1,
			maxlength: 1024,
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

const QuestionSchema = new mongoose.Schema(
	{
		question: {
			type: String,
			required: [true, 'Please add a question'],
			minlength: 10,
			maxlength: 1024,
			trim: true,
			lowercase: true,
			document: [{ type: String }],
		},
		description: {
			type: String,
			minlength: 10,
			maxlength: 1024,
		},
		tip: {
			type: String,
			minlength: 10,
			maxlength: 1024,
		},
		answers: {
			type: [AnswerSchema],
			required: true,
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
		explanation: {
			type: String,
			minlength: 10,
			maxlength: 5000,
		},
	},
	{ _id: false },
);

const QuizSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		title: {
			type: String,
			required: [true, 'Please add a test name'],
			minlength: 6,
			maxlength: 200,
		},
		image: {
			type: String,
			default: 'string url for our default test image',
		},
		instructions: {
			type: String,
			minlength: 3,
			maxlength: 2000,
		},
		questions: {
			type: [QuestionSchema],
			required: true,
			validate: {
				validator: (value) => {
					return value && value.length >= 5;
				},
				message: 'Must have at least 5 questions for a valid test',
			},
		},
		// schedule tests
		time: {
			start: { type: Date },
			end: { type: Date },
		},
		// user can go to previous responses & change them
		allowAnswerChanges: {
			type: Boolean,
			default: false,
		},
		allowMultipleAnswers: {
			type: Boolean,
			default: true,
		},
		successRate: {
			type: Number,
			default: '70',
		},
		// canadian point system test || normal
		system: {
			type: String,
			enum: ['canadian', 'normal'],
			default: 'normal',
		},
		difficulty: {
			type: String,
			enum: ['beginner', 'basic', 'intermediate', 'advanced', 'expert'],
			default: 'basic',
		},
		attempts: {
			type: Number,
			default: 0,
		},
		// questions
		shuffle: {
			default: false,
			type: Boolean,
		},
		showResult: {
			type: Boolean,
			default: false,
		},
		draft: {
			type: Boolean,
			default: false,
		},
		tags: [
			{
				type: String,
				enum: [''],
			},
		],
		category: {
			type: String,
		},
		correction: {
			type: String,
			enum: ['manual', 'automatic'],
		},
	},
	{
		timestamps: true, // will take care of createdAt & updatedAt
	},
);

const validateAnswer = Joi.object().keys({
	answer: Joi.string().min(1).max(1024).required(),
	isCorrect: Joi.boolean(),
	number: Joi.number(),
});

const validateQuestion = Joi.object().keys({
	question: Joi.string().min(10).max(1024).required(),
	description: Joi.string().min(10).max(1024),
	answers: Joi.array().items(validateAnswer),
	point: Joi.number(),
});

function validateQuiz(quiz) {
	const schema = Joi.object({
		user: Joi.objectId().required(),
		title: Joi.string().min(6).max(200).required(),
		questions: Joi.array().items(validateQuestion),
		image: Joi.string(),
		instructions: Joi.string().min(3).max(2000),
		allowAnswerChanges: Joi.boolean(),
		allowMultipleAnswers: Joi.boolean(),
		successRate: Joi.number(),
		system: Joi.string(),
		difficulty: Joi.string(),
		attempts: Joi.number(),
		shuffle: Joi.boolean(),
		showResult: Joi.boolean(),
		draft: Joi.boolean(),
	});

	return schema.validate(quiz);
}

module.exports.validate = validateQuiz;
module.exports.Quiz = mongoose.model('Quiz', QuizSchema);
