const { clearHash } = require('../utils/cache');

module.exports = async (req, res, next) => {
	// Wait until the req is executed so we don't have to deal with req errors
	await next();

	clearHash(req.user.id);
};
