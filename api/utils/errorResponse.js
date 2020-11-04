// class errorResponse extends Error {
// 	constructor(message, statusCode) {
// 		super(message);
// 		this.statusCode = statusCode;
// 	}
// }

class errorResponse extends Error {
	constructor(name, httpCode, description, isOperational) {
		super(description);
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = name;
		this.httpCode = httpCode;
		this.isOperational = isOperational;

		Error.captureStackTrace(this);
	}
}

module.exports = errorResponse;
