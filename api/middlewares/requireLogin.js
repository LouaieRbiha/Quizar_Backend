const isLoggedIn = (req, res, next) => {
	return req.user ? next() : res.sendStatus(401);
};

module.exports = isLoggedIn;
