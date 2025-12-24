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
        const { latitude, longitude, maxDistance = 50000, city } = req.query; // maxDistance default 50km

        let geoShops = [];
        let cityShops = [];

        // 1. Geospatial Search (if lat/long provided)
        if (latitude && longitude) {
            geoShops = await User.find({
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
            }).select('-Password -googleId');
        }

        // 2. City-based Search (if city provided) - for shops without precise location or legacy data
        if (city) {
            cityShops = await User.find({
                role: 'Shopkeeper',
                City: { $regex: city, $options: 'i' }
            }).select('-Password -googleId');
        }

        // 3. Merge and Deduplicate
        const allShopsMap = new Map();

        geoShops.forEach(shop => allShopsMap.set(shop._id.toString(), shop));
        cityShops.forEach(shop => allShopsMap.set(shop._id.toString(), shop));

        const uniqueShops = Array.from(allShopsMap.values());

        res.json(uniqueShops);
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
