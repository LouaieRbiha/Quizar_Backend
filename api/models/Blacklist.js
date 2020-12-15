const mongoose = require('mongoose');

const BlacklistSchema = new mongoose.Schema(
	{
		token: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
		_id: false,
	},
);

module.exports.Blacklist = mongoose.model('Blacklist', BlacklistSchema);
