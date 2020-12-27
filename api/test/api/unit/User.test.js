/* eslint-disable no-underscore-dangle */
/**
 * @group unit/auth
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../../../models/User');

describe('Name of the group', () => {
	it('should ', async () => {
		// 3 well-separated sections: Arrange, Act & Assert (AAA)
	});
});

describe('JWT', () => {
	it('should return a valid jwt token', () => {
		const payload = {
			_id: new mongoose.Types.ObjectId().toHexString(),
		};
		const user = new User(payload);
		const token = user.schema.methods.getSignedJwtToken(payload._id);

		const decoded = jwt.verify(token, config.get('JWT_SECRET'));

		// not matching objects in order not to deal with expire...
		// expect(decoded).toMatchObject(payload);

		expect(decoded.id).toMatch(payload._id);
	});
});
