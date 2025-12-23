const User = require('../models/Users');
const ShopItem = require('../models/ShopItems');

const search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Escape special characters to prevent regex crashes
        const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        const regex = new RegExp(escapeRegex(q), 'i');

        const shops = await User.find({
            role: 'Shopkeeper',
            Name: regex,
            IsAvailable: true
        }).select('-Password');


        const items = await ShopItem.find({
            name: regex
        }).populate('shopkeeperId', 'Name Address');

        res.json({ shops, items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { search };
