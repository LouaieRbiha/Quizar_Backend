/* eslint-disable security/detect-unsafe-regex */
const mongoose = require('mongoose');
const config = require('config');
const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, 'Please add a first name'],
			trim: true,
			lowercase: true,
		},
		lastName: {
			type: String,
			required: [true, 'Please add a last name'],
			trim: true,
			lowercase: true,
		},
		email: {
			type: String,
			required: [true, 'please add an email'],
			unique: true,
			// eslint-disable-next-line no-useless-escape
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
			trim: true,
			lowercase: true,
		},
		username: {
			type: String,
			trim: true,
			lowercase: true,
		},
		password: {
			type: String,
			minlength: 6,
			// select: false, // do not show the password on select
		},
		birthDate: {},
		picture: {
			type: String,
			default: 'https://www.cvwizard.fr/assets/images/default-avatar.png',
		},
		genre: {},
		address: {
			type: String,
			trim: true,
			lowercase: true,
		},
		role: {
			type: String,
			enum: ['user', 'publisher', 'candidate'],
			default: 'candidate',
		},
		resetPasswordToken: {
			type: String,
			required: false,
		},
		documents: {}, // string urls of the uploaded files
		timezone: {},
		// authorizations: {}, // probably use firebase for realtime stuff in frontend
		// statistics: {}, can be a schema
		lastActiveAt: {
			type: Date,
			default: Date.now,
		},
		// achievement:{}, can be a schema
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

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	if (!this.google.id && !this.linkedin.id) {
		const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
		this.password = await bcrypt.hash(this.password, salt);
	}
	next();
});

// Match password user entered password to hashed password in db
UserSchema.methods.isValidPassword = async function (password) {
	const compare = await bcrypt.compare(password, this.password);
	return compare;
};

// Sign jwt and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign(
		{
			// eslint-disable-next-line no-underscore-dangle
			id: this._id,
		},
		config.get('JWT_SECRET'),
		{
			expiresIn: config.get('JWT_SECRET'),
		},
	);
};

module.exports.User = mongoose.model('User', UserSchema);
