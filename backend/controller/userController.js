const User = require('../models/Users');

const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.location = {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
        };

        await user.save(); // This might error if other required fields are missing/check validation
        // But since we are updating existing user, it should be fine.

        res.json({ message: 'Location updated', location: user.location });
    } catch (error) {
        console.error("Update location error:", error);
        res.status(500).json({ message: 'Server error updating location' });
    }
};

const getNearbyDeliveryPartners = async (longitude, latitude) => {
    // Helper function to find available partners
    return await User.find({
        role: 'DeliveryPartner',
        IsAvailable: true,
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                },
                $maxDistance: 10000 // 10km radius
            }
        }
    }).limit(1); // Get the closest one
};

module.exports = { updateLocation, getNearbyDeliveryPartners };
