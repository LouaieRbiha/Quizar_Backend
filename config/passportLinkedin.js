/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const config = require('config');
const { User } = require('../api/models/User');

passport.use(
	new LinkedInStrategy(
		{
			clientID: config.get('LINKEDIN.CLIENT_ID'),
			clientSecret: config.get('LINKEDIN.CLIENT_SECRET'),
			callbackURL: config.get('LINKEDIN.CALLBACK'),
			scope: ['r_emailaddress', 'r_liteprofile'],
			session: false,
		},
		function (accessToken, refreshToken, profile, done) {
			process.nextTick(async () => {
				try {
					const existingUser = await User.findOne({ 'linkedin.id': profile.id });
					if (existingUser) {
						return done(null, existingUser);
					}
					const user = await new User({
						firstname: profile.name.givenName,
						lastname: profile.name.familyName,
						email: profile.emails[0].value,
						picture: profile.photos[0].value,
						'linkedin.id': profile.id,
						'linkedin.token': accessToken,
					}).save();
					return done(null, user);
				} catch (err) {
					done(err, null);
				}
			});
		},
	),
);
