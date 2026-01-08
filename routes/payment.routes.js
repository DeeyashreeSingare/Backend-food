const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/authJwt');

router.get('/order/:orderId', [verifyToken], paymentController.getPaymentByOrderId);

module.exports = router;
