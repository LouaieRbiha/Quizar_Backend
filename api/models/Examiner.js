const mongoose = require('mongoose');
const { User } = require('./User');

const Examiner = User.discriminator('Examiner', new mongoose.Schema({}));

module.exports.Examiner = Examiner;
