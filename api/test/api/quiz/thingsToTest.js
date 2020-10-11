const expect = require('chai');
const { ConnectionWrapper } = require('mockgoose');
const request = require('supertest');

const app = require('../../../app.js');
const conn = require('../../../db/index.js');

describe('POST /notes', () => {
	before((done) => {
		conn
			.connect()
			.then(() => done)
			.catch((err) => done(err));
	});
});
