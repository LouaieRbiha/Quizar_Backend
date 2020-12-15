const _ = require('lodash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const { User } = require('../models/User');

// passport.serializeUser((user, done) => {
// 	done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
// 	User.findById(id, function (err, user) {
// 		done(err, user);
// 	});
// });

passport.use(
	'signup',
	new LocalStrategy(
		{
			usernameField: 'username', // can override with other things
			passwordField: 'password',
			passReqToCallback: true, // allows us to pass back the entire request to the callback
		},
		async (req, username, password, done) => {
			try {
				const body = _.omit(req.body, ['username', 'password']);
				const userObj = {
					...body,
					username,
					password,
				};

				const user = await User.create(userObj);
				return done(null, user);
			} catch (error) {
				done(error);
			}
		},
	),
);

passport.use(
	'signin',
	new LocalStrategy(
		{
			usernameField: 'username',
			passwordField: 'password',
		},
		async (username, password, done) => {
			try {
				const user = await User.findOne({ username }); // check email too with or

				if (!user) {
					return done(null, false, { message: 'User not found' });
				}

				const validate = await user.isValidPassword(password);

				if (!validate) {
					return done(null, false, { message: 'Wrong Password' });
				}

				return done(null, user, { message: 'Logged in Successfully' });
			} catch (error) {
				return done(error);
			}
		},
	),
);

passport.use(
	new JWTstrategy(
		{
			secretOrKey: 'secretFromConfig',
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
		},
		async (token, done) => {
			try {
				return done(null, token.user);
			} catch (error) {
				done(error);
			}
		},
	),
);
