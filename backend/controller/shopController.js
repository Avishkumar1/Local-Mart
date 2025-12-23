const ShopItem = require('../models/ShopItems');
const User = require('../models/Users');


const addItem = async (req, res) => {
    try {
        const { name, description, price, quantity, category, images } = req.body;


        const item = await ShopItem.create({
            shopkeeperId: req.user._id,
            name,
            description,
            price,
            quantity,
            category,
            images
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getItems = async (req, res) => {
    try {
        const items = await ShopItem.find();
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



const getMyShopItems = async (req, res) => {
    try {
        const items = await ShopItem.find({ shopkeeperId: req.user._id });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const updateItem = async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }


        if (item.shopkeeperId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedItem = await ShopItem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deleteItem = async (req, res) => {
    try {
        const item = await ShopItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }


        if (item.shopkeeperId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await item.deleteOne();

        res.json({ message: 'Item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllShops = async (req, res) => {
    try {
        const { city } = req.query;
        let query = { role: 'Shopkeeper' };
        
        // Filter by city if provided
        if (city) {
            query.City = { $regex: city, $options: 'i' }; // Case-insensitive search
        }
        
        const shops = await User.find(query).select('-Password');
        res.json(shops);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getShopIdItems = async (req, res) => {
    try {
        const items = await ShopItem.find({ shopkeeperId: req.params.id });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getNearbyShops = async (req, res) => {
    try {
        const { latitude, longitude, maxDistance = 10000, city } = req.query; // maxDistance in meters, default 10km

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        let query = {
            role: 'Shopkeeper',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        };
        
        // Filter by city if provided
        if (city) {
            query.City = { $regex: city, $options: 'i' }; // Case-insensitive search
        }

        const shops = await User.find(query).select('-Password -googleId');

        res.json(shops);
    } catch (error) {
        console.error("Nearby shops error:", error);
        res.status(500).json({ message: 'Server error fetching nearby shops' });
    }
};

module.exports = {
    addItem,
    getItems,
    getMyShopItems,
    updateItem,
    deleteItem,
    getAllShops,
    getShopIdItems,
    getNearbyShops
};
