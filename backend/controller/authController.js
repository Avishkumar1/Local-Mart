const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


const registerUser = async (req, res) => {
    try {
        const { Name, Email, Password, Phone, Address, DOB, Gender, City } = req.body;

        const userExists = await User.findOne({ Email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const user = await User.create({
            Name,
            Email,
            Password: hashedPassword,
            Phone: Phone || undefined, // Handle empty string
            Address,
            City: City || undefined, // City field for location-based filtering
            DOB,
            Gender,
            role: 'Customer'
        });

        if (user) {
            const token = generateToken(user.userId, 'Customer');
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
                secure: true
            });

            res.status(201).json({
                message: "User registered successfully",
                user: {
                    _id: user._id,
                    userId: user.userId,
                    Name: user.Name,
                    Email: user.Email,
                    role: 'Customer',
                    location: user.location
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const loginUser = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const user = await User.findOne({ Email });

        if (user && (await bcrypt.compare(Password, user.Password))) {
            const token = generateToken(user.userId, user.role); // Use actual role
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
                secure: true
            });

            res.json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    userId: user.userId,
                    Name: user.Name,
                    Email: user.Email,
                    role: user.role,
                    location: user.location
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const registerShopkeeper = async (req, res) => {
    try {
        const { Name, Email, Password, Phone, Address, City } = req.body;

        const userExists = await User.findOne({ Email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const user = await User.create({
            Name,
            Email,
            Password: hashedPassword,
            Phone: Phone || undefined, // Handle empty string
            Address,
            City: City || undefined, // City field for location-based filtering
            role: 'Shopkeeper',
            IsAvailable: true
        });

        if (user) {
            const token = generateToken(user.userId, 'Shopkeeper');
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
                secure: true
            });

            res.status(201).json({
                message: "Shopkeeper registered successfully",
                user: {
                    _id: user._id,
                    userId: user.userId,
                    Name: user.Name,
                    Email: user.Email,
                    role: 'Shopkeeper'
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const loginShopkeeper = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const user = await User.findOne({ Email });

        if (user && (await bcrypt.compare(Password, user.Password))) {
            if (user.role !== 'Shopkeeper') {
                return res.status(401).json({ message: 'Not authorized as shopkeeper' });
            }

            const token = generateToken(user.userId, 'Shopkeeper');
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
                secure: true
            });

            res.json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    userId: user.userId,
                    Name: user.Name,
                    Email: user.Email,
                    role: 'Shopkeeper'
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const registerDeliveryPartner = async (req, res) => {
    try {
        const { Name, Email, Password, Phone, Address, City } = req.body;

        const userExists = await User.findOne({ Email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(Password, 10);

        const user = await User.create({
            Name,
            Email,
            Password: hashedPassword,
            Phone: Phone || undefined, // Handle empty string
            Address,
            City: City || undefined, // City field for location-based filtering
            role: 'DeliveryPartner',
            IsAvailable: true
        });

        if (user) {
            const token = generateToken(user.userId, 'DeliveryPartner');
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
                secure: true
            });

            res.status(201).json({
                message: "Delivery Partner registered successfully",
                user: {
                    _id: user._id,
                    userId: user.userId,
                    Name: user.Name,
                    Email: user.Email,
                    role: 'DeliveryPartner',
                    location: user.location
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginDeliveryPartner = async (req, res) => {
    try {
        const { Email, Password } = req.body;

        const user = await User.findOne({ Email });

        if (user && (await bcrypt.compare(Password, user.Password))) {
            if (user.role !== 'DeliveryPartner') {
                return res.status(401).json({ message: 'Not authorized as Delivery Partner' });
            }

            const token = generateToken(user.userId, 'DeliveryPartner');
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'none',
                secure: true
            });

            res.json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    userId: user.userId,
                    Name: user.Name,
                    Email: user.Email,
                    role: 'DeliveryPartner',
                    location: user.location
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        sameSite: 'none',
        secure: true
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

const getProfile = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const safe = {
            _id: req.user._id,
            userId: req.user.userId,
            Name: req.user.Name,
            Email: req.user.Email,
            Phone: req.user.Phone,
            Address: req.user.Address,
            DOB: req.user.DOB,
            Gender: req.user.Gender,
            role: req.user.role,
            avatar: req.user.avatar,
            IsAvailable: req.user.IsAvailable
        };

        return res.json({ user: safe });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const oauthCallback = (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = generateToken(req.user.userId, req.user.role || 'Customer');
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'none',
            secure: true
        });

        const redirectUrl = process.env.FRONTEND_URL
            ? `${process.env.FRONTEND_URL}?token=${token}`
            : `http://localhost:3000?token=${token}`;
        return res.redirect(redirectUrl);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    registerShopkeeper,
    loginShopkeeper,
    registerDeliveryPartner,
    loginDeliveryPartner,
    logout,
    getProfile,
    oauthCallback
};
