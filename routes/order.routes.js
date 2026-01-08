const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isEndUser, isRestaurant, isRider } = require('../middleware/authJwt');

// End User routes
router.post('/', [verifyToken, isEndUser], orderController.createOrder);
router.get('/my-orders', [verifyToken, isEndUser], orderController.getMyOrders);

// Restaurant routes
router.get('/restaurant/:restaurantId', [verifyToken, isRestaurant], orderController.getRestaurantOrders);
router.put('/:id/status', [verifyToken, isRestaurant], orderController.updateOrderStatus);

// Rider routes
router.get('/available', [verifyToken, isRider], orderController.getAvailableOrders);
router.post('/:id/accept', [verifyToken, isRider], orderController.acceptOrder);
router.put('/:id/rider-status', [verifyToken, isRider], orderController.updateRiderStatus);
router.get('/rider/my-orders', [verifyToken, isRider], orderController.getRiderOrders);

// Common route (accessible by all authenticated users)
router.get('/:id', [verifyToken], orderController.getOrderById);

module.exports = router;
