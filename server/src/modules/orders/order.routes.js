const express = require('express');
const router = express.Router();
const ctrl = require('./order.controller');
const { validateConvert, validateUpdateStatus, validateUUID } = require('./order.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/convert', requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateConvert, ctrl.convertQuotationToOrder);
router.get('/', ctrl.getOrders);
router.get('/:id', validateUUID('id'), ctrl.getOrderById);
router.put('/:id/status', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER']), validateUpdateStatus, ctrl.updateOrderStatus);

module.exports = router;
