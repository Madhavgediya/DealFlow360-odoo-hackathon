const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const authValidation = require('./auth.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { authLimiter } = require('../../middleware/rateLimit.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');

router.post('/signup', authLimiter, authValidation.validateSignup, authController.signup);
router.post('/signin', authLimiter, authValidation.validateSignin, authController.signin);
router.post('/logout', authController.logout);
router.post('/impersonate', authenticate, requireRole(['ADMIN']), authValidation.validateImpersonate, authController.impersonate);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
