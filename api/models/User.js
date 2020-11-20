const mongoose = require('mongoose');
const config = require('config');

const UserSchema = new Schema({
	firstName: {
		type: String,
		required: [true, 'Please add a first name'],
	},
	lastName: {
		type: String,
		required: [true, 'Please add a last name'],
	},
	email: {
		type: String,
		required: [true, 'please add an email'],
		unique: true,
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
	},
	birthDate: {},
	genre: {},
	address: {},
	role: {
		type: String,
		enum: ['user', 'publisher'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'please add a password'],
		minlength: 6,
		select: false, // do not show the password on select
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	modifiedAt: {
		type: Date,
		default: Date.now,
	},
	googleId: {
		type: String,
		required: false,
	},
	displayName: {
		type: String,
		required: false,
	},
	resetPasswordToken: {
		type: String,
		required: false,
	},
	documents: {}, // string urls of the uploaded files
	timezone: {},
	authorizations: {}, // probably use firebase for realtime stuff in frontend
	lastOnline: {},
	loginId: {},
	statistics: {},
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

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

// Match password user entered password to hashed password in db
UserSchema.methods.matchPassword = async function (enteredPassword) {
	const result = await bcrypt.compare(enteredPassword, this.password);
	return result;
};

module.exports.User = mongoose.model('User', UserSchema);
