const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const { authenticate } = require('../../middleware/auth.middleware');

router.post('/signup', authValidation.validateSignup, authController.signup);
router.post('/signin', authValidation.validateSignin, authController.signin);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
