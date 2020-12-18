const mongoose = require('mongoose');
const Joi = require('joi');

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

		// can be negative (canadian system) ?
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

function validateSubmission(submission) {
	const schema = Joi.object({
		user: Joi.objectId().required(),
		test: Joi.objectId().required(),
	});

	return schema.validate(submission);
}

module.exports.validate = validateSubmission;
module.exports.Submission = mongoose.model('Submission', SubmissionSchema);
