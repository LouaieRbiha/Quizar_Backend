const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('config');
const { User } = require('../models/User');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then((user) => {
		done(null, user);
	});
});

passport.use(
	new GoogleStrategy(
		{
			callbackURL: '/api/v1/auth/google/callback',
			clientID: config.get('OAuth.GOOGLE_CLIENT_ID'),
			clientSecret: config.get('OAuth.GOOGLE_CLIENT_SECRET'),
			proxy: true,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const existingUser = await User.findOne({ googleId: profile.id });
				if (existingUser) {
					return done(null, existingUser);
				}
				const user = await new User({
					googleId: profile.id,
					displayName: profile.displayName,
				}).save();
				done(null, user);
			} catch (err) {
				done(err, null);
			}
		},
	),
);
