const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema(
	{
		creator: {}, // test owner
		title: {
			type: String,
			required: [true, 'Please add a test name'],
			minlength: 10,
			maxlength: 200,
		},
		image: {
			type: String,
			default: 'string url for our default test image',
		},
		instruction: {
			type: String,
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
		attempt: {
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

module.exports.Test = mongoose.model('Test', TestSchema);
