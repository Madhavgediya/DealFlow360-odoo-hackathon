const express = require('express');
const router = express.Router();
const ctrl = require('./payment.controller');
const { validateRegister, validateUUID } = require('./payment.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/register', requireRole(['ADMIN', 'BILLING_MANAGER']), validateRegister, ctrl.registerPayment);
router.get('/', ctrl.getPayments);
router.get('/:id', validateUUID('id'), ctrl.getPaymentById);

module.exports = router;
