const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/authJwt');

router.get('/profile', [verifyToken], userController.getProfile);
router.put('/profile', [verifyToken], userController.updateProfile);

module.exports = router;
