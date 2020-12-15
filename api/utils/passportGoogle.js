/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('config');
const { User } = require('../models/User');

passport.use(
	new GoogleStrategy(
		{
			callbackURL: config.get('OAuth.GOOGLE_CALLBACK'),
			clientID: config.get('OAuth.GOOGLE_CLIENT_ID'),
			clientSecret: config.get('OAuth.GOOGLE_CLIENT_SECRET'),
			proxy: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const existingUser = await User.findOne({ 'google.id': profile._json.sub });
				if (existingUser) {
					return done(null, existingUser);
				}
				const user = await new User({
					firstName: profile._json.given_name,
					lastName: profile._json.family_name,
					email: profile._json.email,
					picture: profile._json.picture,
					'google.id': profile._json.sub,
					'google.token': accessToken,
				}).save();
				return done(null, user);
			} catch (err) {
				done(err, null);
			}
		},
	),
);
