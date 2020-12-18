/* eslint-disable security/detect-unsafe-regex */
const mongoose = require('mongoose');
const config = require('config');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
	{
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
			select: true, // must be false
		},
		birthdate: {
			type: String,
		},
		picture: {
			type: String,
			default: 'https://www.cvwizard.fr/assets/images/default-avatar.png',
		},
		gender: {
			type: String,
			enum: ['man', 'woman'],
		},
		address: {
			type: String,
			trim: true,
			lowercase: true,
		},
		role: {
			type: String,
			enum: ['admin', 'publisher', 'candidate'],
			default: 'candidate',
		},
		resetPasswordToken: String,
		resetPasswordExpire: Date,
		documents: {}, // string urls of the uploaded files
		timezone: {},
		authorizations: {}, // probably use firebase for realtime stuff in frontend
		statistics: {}, // can be a schema
		lastActiveAt: {
			type: Date,
			default: Date.now,
		},
		achievements: {}, // can be a schema
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
	},
	{
		timestamps: true, // will take care of createdAt & updatedAt
	},
);

// Sign jwt and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign(
		{
			// eslint-disable-next-line no-underscore-dangle
			id: this._id,
		},
		config.get('JWT_SECRET'),
		{
			expiresIn: config.get('JWT_EXPIRE'),
		},
	);
};

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
module.exports.User = mongoose.model('User', UserSchema);
