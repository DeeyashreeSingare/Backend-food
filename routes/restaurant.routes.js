const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { verifyToken, isRestaurant } = require('../middleware/authJwt');
const upload = require('../middleware/upload');

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:restaurantId/menu', restaurantController.getMenuItems);

// Restaurant owner routes
router.post('/', [verifyToken, isRestaurant, upload.single('image')], restaurantController.createRestaurant);
router.get('/owner/my-restaurants', [verifyToken, isRestaurant], restaurantController.getMyRestaurants);
router.put('/:id', [verifyToken, isRestaurant, upload.single('image')], restaurantController.updateRestaurant);
router.post('/:restaurantId/menu', [verifyToken, isRestaurant, upload.single('image')], restaurantController.createMenuItem);
router.put('/:restaurantId/menu/:itemId', [verifyToken, isRestaurant, upload.single('image')], restaurantController.updateMenuItem);

module.exports = router;
