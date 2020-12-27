const mongoose = require('mongoose');
const { User } = require('./User');

const Recruiter = User.discriminator('Recruiter', new mongoose.Schema({}));

module.exports.Recruiter = Recruiter;
