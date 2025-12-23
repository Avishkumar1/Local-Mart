const Order = require('../models/Orders');
const ShopItem = require('../models/ShopItems');
const User = require('../models/Users');


const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }


        const shopId = items[0].shopId;

        const order = new Order({
            userId: req.user._id,
            shopId: shopId,
            items: items.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.cartQuantity,
                price: item.price,
                image: item.image
            })),
            totalAmount,
            shippingAddress: shippingAddress || req.user.Address || "Default Address"
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ message: 'Server error creating order' });
    }
};

const getShopOrders = async (req, res) => {
    try {
        if (req.user.role !== 'Shopkeeper') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const orders = await Order.find({ shopId: req.user._id })
            .populate('userId', 'Name Email Phone')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Fetch orders failed:", error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};


const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Authorization check: Shopkeeper or Delivery Partner (for updates like PickedUp/Delivered)
        // Allow Shopkeeper to accept/reject.
        // Allow Partner to PickUp/Deliver.

        // For simplicity, sticking to shopkeeper/partner checks loosely or allowing specific transitions per role.
        // Assuming req.user is populated by auth middleware

        if (req.user.role === 'Shopkeeper' && order.shopId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (req.user.role === 'DeliveryPartner' && order.deliveryPartnerId && order.deliveryPartnerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.status = status;

        // If status is Accepted, find and assign Delivery Partner
        if (status === 'Accepted') {
            const shop = await User.findById(order.shopId);
            if (shop && shop.location && shop.location.coordinates) {
                const partners = await User.find({
                    role: 'DeliveryPartner',
                    IsAvailable: true,
                    location: {
                        $near: {
                            $geometry: shop.location, // Use shop location
                            $maxDistance: 15000 // 15km radius
                        }
                    }
                }).limit(1);

                if (partners.length > 0) {
                    order.deliveryPartnerId = partners[0]._id;
                    order.status = 'Assigned'; // Auto-transition
                    console.log(`Order ${order._id} assigned to ${partners[0].Name}`);
                } else {
                    console.log("No delivery partner found nearby");
                }
            }
        }

        await order.save();
        res.json(order);
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ message: 'Server error updating order' });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate('shopId', 'Name Address')
            .populate('items.productId', 'name image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Get user orders error:", error);
        res.status(500).json({ message: 'Server error fetching user orders' });
    }
};

const getDeliveryOrders = async (req, res) => {
    try {
        if (req.user.role !== 'DeliveryPartner') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const orders = await Order.find({ deliveryPartnerId: req.user._id })
            .populate('shopId', 'Name Address Phone')
            .populate('userId', 'Name Phone')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Get delivery orders error:", error);
        res.status(500).json({ message: 'Server error fetching delivery orders' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('shopId', 'Name Address Phone location')
            .populate('deliveryPartnerId', 'Name Phone location')
            .populate('userId', 'Name Phone Address');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Security: Ensure requester is related to the order
        const isUser = order.userId._id.toString() === req.user._id.toString();
        const isShop = order.shopId._id.toString() === req.user._id.toString();
        const isPartner = order.deliveryPartnerId && order.deliveryPartnerId._id.toString() === req.user._id.toString();

        if (!isUser && !isShop && !isPartner) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (error) {
        console.error("Get order details error:", error);
        res.status(500).json({ message: 'Server error fetching order details' });
    }
};

module.exports = { createOrder, getShopOrders, updateOrderStatus, getUserOrders, getOrderById, getDeliveryOrders };
