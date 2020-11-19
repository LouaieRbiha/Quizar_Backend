const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
	googleId: String,
	displayName: String,
});

module.exports.User = mongoose.model('User', UserSchema);
