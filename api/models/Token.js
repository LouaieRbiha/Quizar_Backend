const mongoose = require('mongoose');
const Joi = require('joi');

const TokenSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		logged_out: {
			type: Boolean,
			default: false,
		},
		logged_in_at: {
			type: Date,
			default: Date.now,
		},
		logged_out_at: {
			type: Date,
			default: Date.now,
		},
		ip_address: {
			type: String,
		},
		token_secret: {
			type: String,
		},
		token_deleted: {
			type: Boolean,
			default: false,
		},
		device: {
			type: String,
		},
	},
	{
		timestamps: true, // will take care of createdAt & updatedAt
	},
);

function validateToken(token) {
	const schema = Joi.object({
		user: Joi.objectId().required(),
	});

	return schema.validate(token);
}

module.exports.validate = validateToken;
module.exports.Token = mongoose.model('Token', TokenSchema);
