const mongoose = require('mongoose');

const TestSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Please add a test name'],
		minlength: 0,
		maxlength: 0,
	},
	// can be a document
	// type , count, allow multiple answers,
	questions: {
		required: true,
	},
	// can have a description
	answers: {
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		required: true,
	},
	modifiedAt: {
		type: Date,
		default: Date.now,
		required: true,
	},
	time: {},
	// user can go to previous responses & change them
	allowAnswerChanges: {
		required: true,
		default: true,
	},
	successRate: {
		required: true,
		default: '70',
	},
	// canadian point system test || normal
	system: {},
});

module.exports.Test = mongoose.model('Test', TestSchema);
