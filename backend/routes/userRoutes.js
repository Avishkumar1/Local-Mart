const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controller/userController');
const passport = require('passport');

// Middleware to protect routes
const protect = passport.authenticate('jwt', { session: false });

router.put('/location', protect, updateLocation);

module.exports = router;
