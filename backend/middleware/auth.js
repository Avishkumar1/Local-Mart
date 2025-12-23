const passport = require('passport');


const auth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
        }
        req.user = user;
        req.role = user.role; 
        next();
    })(req, res, next);
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.role)) {
            return res.status(403).json({ message: "Forbidden: Access denied" });
        }
        next();
    };
};

module.exports = { auth, authorize };
