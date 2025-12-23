const express = require('express');
const router = express.Router();
const {
    addItem,
    getItems,
    getMyShopItems,
    updateItem,
    deleteItem,
    getAllShops,
    getShopIdItems,
    getNearbyShops
} = require('../controller/shopController');
const { auth, authorize } = require('../middleware/auth');


router.get('/', getItems);
router.get('/nearby', getNearbyShops);
router.get('/shops', getAllShops);
router.get('/shops/:id', getShopIdItems);


router.post('/add', auth, authorize(['Shopkeeper']), addItem);
router.get('/myshop', auth, authorize(['Shopkeeper']), getMyShopItems);
router.put('/:id', auth, authorize(['Shopkeeper']), updateItem);
router.delete('/:id', auth, authorize(['Shopkeeper']), deleteItem);

module.exports = router;
