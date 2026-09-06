const express = require('express');
const router = express.Router();
const ctrl = require('./product.controller');
const { validateCreate, validateUpdate, validateUUID } = require('./product.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

const ALLOWED_PRODUCT_MANAGERS = ['SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER', 'PRODUCT_MANAGER'];

router.post('/', requireRole(ALLOWED_PRODUCT_MANAGERS), validateCreate, ctrl.createProduct);
router.get('/', ctrl.getProducts);
router.get('/:id', validateUUID('id'), ctrl.getProductById);
router.put('/:id', validateUUID('id'), requireRole(ALLOWED_PRODUCT_MANAGERS), validateUpdate, ctrl.updateProduct);
router.patch('/:id', validateUUID('id'), requireRole(ALLOWED_PRODUCT_MANAGERS), validateUpdate, ctrl.updateProduct);
router.delete('/:id', validateUUID('id'), requireRole(ALLOWED_PRODUCT_MANAGERS), ctrl.deleteProduct);

module.exports = router;
