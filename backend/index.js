const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 9002;
const connectDB = require('./connection');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');


app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'https://local-mart-lyart.vercel.app'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());


require('./config/passport')(passport);


// connectDB();


// app.get('/', (req, res) => {
//     res.send('API is running...');
// });


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/shopRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/user', require('./routes/userRoutes'));


if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    });
}

module.exports = app;


