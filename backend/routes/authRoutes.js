const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    registerShopkeeper,
    loginShopkeeper,
    registerDeliveryPartner,
    loginDeliveryPartner,
    logout,
    getProfile,
    oauthCallback
} = require('../controller/authController');
const passport = require('passport');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/shopkeeper/register', registerShopkeeper);
router.post('/shopkeeper/login', loginShopkeeper);
router.post('/delivery/register', registerDeliveryPartner);
router.post('/delivery/login', loginDeliveryPartner);
router.post('/logout', logout);
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '/login' }),
    oauthCallback
);

module.exports = router;
