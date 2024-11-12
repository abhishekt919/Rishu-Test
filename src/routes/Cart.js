const express = require('express');
const router = express.Router();
const cartController = require('../controllers/Cart');

router.post('/cart/add', cartController.addItemToCart);
router.get('/cart', cartController.getCart);
router.patch('/cart/update-or-remove-item', cartController.updateOrRemoveItemFromCart);
router.delete('/cart/remove-item', cartController.RemoveItemFromCart);
router.post('/cart/process-payment', cartController.payment);

module.exports = router;