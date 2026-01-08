const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { checkDuplicateEmail, checkRolesExisted } = require('../middleware/verifySignUp');

router.post('/signup', [checkDuplicateEmail, checkRolesExisted], authController.signup);
router.post('/signin', authController.signin);

module.exports = router;
