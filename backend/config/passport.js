const JwtStrategy = require('passport-jwt').Strategy;
const User = require('../models/Users');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const cookieExtractor = function (req) {
    let token = null;
    if (req && req.cookies) token = req.cookies['token'];
    if (!token && req && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    return token;
};

const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET
};

module.exports = (passport) => {
    passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
        try {

            const user = await User.findOne({ userId: jwt_payload.id });
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        } catch (error) {
            return done(error, false);
        }
    }));

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails && profile.emails[0] && profile.emails[0].value;


            let user = null;
            if (profile.id) {
                user = await User.findOne({ $or: [{ googleId: profile.id }, { Email: email }] });
            } else if (email) {
                user = await User.findOne({ Email: email });
            }

            if (user) {

                if (!user.googleId && profile.id) {
                    user.googleId = profile.id;
                    await user.save();
                }
                return done(null, user);
            }


            const newUser = await User.create({
                Name: profile.displayName || email,
                Email: email,
                Password: '',
                googleId: profile.id,
                role: 'Customer'
            });

            return done(null, newUser);
        } catch (error) {
            return done(error, false);
        }
    }));
};


