const mongoose = require('mongoose');
const Joi = require('joi');

const SubmissionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		quiz: {
			type: mongoose.Schema.ObjectId,
			ref: 'Quiz',
			required: true,
		},
		score: {
			type: number,
			default: 0,
			validate: {
				validator: (value) => {
					if (value < 0) return 0;
				},
			},
		},
		hasPassed: {
			type: Boolean,
			default: false,
		},
		feedback: {
			type: String,
			minlength: 10,
			maxlength: 1024,
			default: undefined,
		},
		mode: {
			type: String,
			enum: ['default', 'anonyme'],
			default: 'default',
		},
	},
	{
		timestamps: true,
	},
);

function validateSubmission(submission) {
	const schema = Joi.object({
		user: Joi.objectId().required(),
		quiz: Joi.objectId().required(),
		score: Joi.number(),
		hasPassed: Joi.boolean(),
		feedback: Joi.string().min(10).max(1024),
		mode: Joi.string(),
	});

	return schema.validate(submission);
}

module.exports.validate = validateSubmission;
module.exports.Submission = mongoose.model('Submission', SubmissionSchema);
