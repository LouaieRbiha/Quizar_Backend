const mongoose = require('mongoose');
const redis = require('redis');
const config = require('config');
const { promisify } = require('util');

const { exec } = mongoose.Query.prototype;

const client = redis.createClient(config.get('REDIS.PORT'), config.get('REDIS.HOSTNAME'), {
	no_ready_check: true,
});

client.hget = promisify(client.hget);
client.hset = promisify(client.hset);

client.auth(config.get('REDIS.PASSWORD'), (err) => {
	if (err) winston.error('Error occured while connecting to redis client', err.message);
});

client.on('error', (err) => {
	if (err) winston.error('Redis error', err.message);
});

client.on('connect', () => {
	console.log(`Redis Connected to ${config.get('REDIS.HOSTNAME')}:${config.get('REDIS.PORT')}`);
});

// Toggle wich query to cache
mongoose.Query.prototype.cache = async function (options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || '');
	return this;
};

// Handle the new exec function with cache
mongoose.Query.prototype.exec = async function () {
	if (!this.useCache) {
		// eslint-disable-next-line prefer-rest-params
		return exec.apply(this, arguments);
	}

	const key = JSON.stringify({ ...this.getFilter(), collection: this.mongooseCollection.name });
	const cachedValue = client.hget(this.hashKey, key);

	if (cachedValue) {
		const doc = JSON.parse(cachedValue);

		return Array.isArray(doc) ? doc.map((d) => this.model(d)) : this.model(doc);
	}

	// eslint-disable-next-line prefer-rest-params
	const result = await exec.apply(this, arguments);

	client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 2 * 60); // expire in 2min

	return result;
};

module.exports = {
	// Clear cache
	clearHash(hashKey) {
		client.del(JSON.stringify(hashKey));
	},
};
