const express = require('express');
const router = express.Router();
const ctrl = require('./customer.controller');
const { validateCreate, validateUpdate, validateUUID } = require('./customer.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateCreate, ctrl.createCustomer);
router.get('/', ctrl.getCustomers);
router.get('/:id', validateUUID('id'), ctrl.getCustomerById);
router.put('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateUpdate, ctrl.updateCustomer);
router.delete('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER']), ctrl.deleteCustomer);

module.exports = router;
