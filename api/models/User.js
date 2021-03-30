/* eslint-disable no-underscore-dangle */
/* eslint-disable security/detect-unsafe-regex */
const mongoose = require('mongoose');
const config = require('config');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const { Quiz } = require('./Quiz');
const { Submission } = require('./Submission');
const ErrorResponse = require('../utils/errorResponse');

const userOptions = {
	discriminatorKey: '__type',
	collection: 'users',
};

// Discriminator use for different type of users
const UserSchema = new mongoose.Schema(
	{
		// Personal information
		firstname: {
			type: String,
			required: [true, 'Please add a first name'],
			trim: true,
			lowercase: true,
			minlength: 3,
			maxlength: 50,
		},
		lastname: {
			type: String,
			required: [true, 'Please add a last name'],
			trim: true,
			lowercase: true,
			minlength: 3,
			maxlength: 50,
		},
		email: {
			type: String,
			required: [true, 'please add an email'],
			unique: true,
			// eslint-disable-next-line no-useless-escape
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
			trim: true,
			lowercase: true,
			minlength: 3,
			maxlength: 255,
		},
		birthdate: {
			type: String,
			trim: true,
			lowercase: true,
		},
		gender: {
			type: String,
			enum: ['man', 'woman'],
		},
		picture: {
			type: String,
		},
		phone: {
			type: String,
		},
		address: {
			type: String,
			trim: true,
			lowercase: true,
		},
		occupation: {
			type: String,
			enum: ['', '', ''],
		},
		companyName: {
			type: String,
			trim: true,
			lowercase: true,
		},
		socialNetworks: {}, // need a model to follow frontend
		documents: {}, // string urls of the uploaded files (schema)
		webiste: {
			type: String,
			trim: true,
			lowercase: true,
		},

		// Account information
		username: {
			type: String,
			trim: true,
			lowercase: true,
			minlength: 6,
			maxlength: 12,
		},
		password: {
			type: String,
			minlength: 3,
			maxlength: 1024,
			select: false,
		},
		role: {
			type: String,
			enum: ['admin', 'examiner', 'examinee', 'recruiter'],
		},
		language: {},
		timezone: {},
		statistics: {}, // can be a schema
		achievements: {}, // can be a schema
		communication: {}, // can be a schema
		emailSettings: {}, // can be a schema

		// Server related stuff
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		authorizations: {}, // probably use firebase for realtime stuff in frontend
		lastActiveAt: {
			// can we get that info from tokens
			type: Date,
			default: Date.now,
		},
		google: {
			id: { type: String },
			token: { type: String },
			required: false,
		},
		linkedin: {
			id: { type: String },
			token: { type: String },
			required: false,
		},
		// field: [
		// 	{
		// 		type: String,
		// 		enum: [''],
		// 	},
		// ],
		tokenVersion: {
			type: Number,
			default: 0,
		},
		accountLocked: {
			type: Boolean,
			default: false,
		},
		badPasswordCount: {
			type: Number,
			default: 0,
		},
		changePasswordDate: {
			type: Date,
		},
		forceChangePassword: {
			type: Boolean,
			default: false,
		},
		passwordHistory: {
			type: [String],
			default: [''],
		},
	},
	{
		userOptions,
		timestamps: true,
	},
);

const User = mongoose.model('User', UserSchema);

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, config.get('JWT.ACCESS_TOKEN.SECRET'), {
		expiresIn: config.get('JWT.ACCESS_TOKEN.EXPIRE'),
	});
};

/**
 * Cascade delete quizzes when an examiner is deleted
 * Can't delete an examinee if he has submissions
 */
User.schema.pre('remove', async function (next) {
	if (this.role === 'examiner') {
		let count = 0;
		const quizzes = await Quiz.findById({ user: this._id });
		quizzes.forEach(async (quiz) => {
			const submissions = await Submission.find({ quiz: quiz._id });
			if (submissions.length > 0) count += 1;
		});
		if (count === 0) {
			await this.model('Quiz').deleteMany({ user: this._id });
		} else {
			next(
				new ErrorResponse(
					`User ${this._id} can not be removed due to his quizzes that have submissions in it`,
				),
				409,
			);
		}
	}

	if (this.role === 'examinee') {
		const submissions = await Submission.find({ user: this._id });
		if (submissions.length > 0)
			next(
				new ErrorResponse(`User ${this._id} can not be removed due to his recent submissions`),
				409,
			);
	}
	next();
});

function validateUser(user) {
	const schema = Joi.object({
		firstname: Joi.string().min(3).max(50).required(),
		lastname: Joi.string().min(3).max(50).required(),
		email: Joi.string().min(3).max(255).required().email(),
		username: Joi.string().min(6).max(12),
		password: Joi.string().min(3).max(1024),
	});

	return schema.validate(user);
}

module.exports.validate = validateUser;
module.exports.User = User;
