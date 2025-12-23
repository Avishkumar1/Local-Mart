const express = require('express');
const router = express.Router();
const { createOrder, getShopOrders, updateOrderStatus, getUserOrders, getOrderById, getDeliveryOrders } = require('../controller/orderController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createOrder);
router.get('/shop', auth, getShopOrders);
router.get('/delivery', auth, getDeliveryOrders);
router.get('/myorders', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id/status', auth, updateOrderStatus);

module.exports = router;
