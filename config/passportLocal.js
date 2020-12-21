const _ = require('lodash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const config = require('config');
const { User } = require('../api/models/User');

passport.use(
	'signup',
	new LocalStrategy(
		{
			usernameField: 'username', // can override with other things
			passwordField: 'password',
			passReqToCallback: true, // allows us to pass back the entire request to the callback
			session: false,
		},
		async (req, username, password, done) => {
			try {
				const body = _.omit(req.body, ['username', 'password']);
				const salt = await bcrypt.genSalt(config.get('BCRYPT_SALT_ROUNDS'));
				const hashedPassword = await bcrypt.hash(password, salt);
				const userObj = {
					...body,
					username,
					password: hashedPassword,
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
			session: false,
		},
		async (username, password, done) => {
			try {
				const user = await User.findOne({ $or: [{ username }, { email: username }] }).select(
					'password',
				);

				if (!user) {
					return done(null, false, { message: 'User not found' });
				}

				const validate = await bcrypt.compare(password, user.password);

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
			session: false,
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
