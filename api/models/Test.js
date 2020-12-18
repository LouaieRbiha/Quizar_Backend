const mongoose = require('mongoose');
const Joi = require('joi');

const TestSchema = new mongoose.Schema(
	{
		creator: {}, // test owner
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
		question: {
			type: [mongoose.Schema.ObjectId],
			ref: 'Question',
			required: true,
			default: undefined,
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
			required: true,
			default: true,
		},
		allowMultipleAnswers: {
			required: true,
			default: true,
		},
		successRate: {
			required: true,
			default: '70',
		},
		// canadian point system test || normal
		system: {
			required: true,
			enum: ['Canadian', 'Normal'],
		},
		difficulty: {
			required: true,
			enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
			default: 'Basic',
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
	},
	{
		timestamps: true, // will take care of createdAt & updatedAt
	},
);

function validateTest(test) {
	const schema = Joi.object({
		title: Joi.string().min(6).max(200).required(),
		question: Joi.objectId().required(),
		instructions: Joi.string().min(3).max(2000),
	});

	return schema.validate(test);
}

module.exports.validate = validateTest;
module.exports.Test = mongoose.model('Test', TestSchema);
