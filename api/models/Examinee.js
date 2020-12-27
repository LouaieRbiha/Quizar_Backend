const mongoose = require('mongoose');
const { User } = require('./User');

const Examinee = User.discriminator('Examinee', new mongoose.Schema({}));

module.exports.Examinee = Examinee;
