const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Role = require('../models/Role');

if (process.env.NODE_ENV !== 'test') {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
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

                    // Assign default role
                    const defaultRole = await Role.findOne({ where: { name: 'user' } });
                    if (defaultRole) await user.addRole(defaultRole);
                }

                const userRoles = (await user.getRoles()).map(r => r.name);

                return done(null, { id: user.id, email: user.email, roles: userRoles });
            } 
            catch (error) {
                return done(error, false);
            }
        }
    ));
}

module.exports = passport;
