const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ where: { email: profile.emails[0].value } });

            if (user) {
                if (!user.provider) {
                    user.provider = 'google';
                    user.providerId = profile.id;
                    await user.save();
                }
            } 
            else {
                user = await User.create({
                    name: profile.displayName,
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    password: '',
                    provider: 'google',
                    providerId: profile.id,
                });
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

            return done(null, { user, token });
        } 
        catch (error) {
            return done(error, false);
        }
    }
));

module.exports = passport;
