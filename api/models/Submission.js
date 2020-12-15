const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
	{
		user: {
			type: [mongoose.Schema.ObjectId],
			ref: 'User',
			required: true,
		},
		test: {
			type: [mongoose.Schema.ObjectId],
			ref: 'Test',
			required: true,
		},
		score: {
			type: number,
			default: 0,
		},
		hasPassed: {
			type: Boolean,
			default: false,
		},
		feedback: {
			type: String,
			default: undefined,
		},
	},
	{
		timestamps: true,
	},
);

module.exports.Submission = mongoose.model('Submission', SubmissionSchema);
