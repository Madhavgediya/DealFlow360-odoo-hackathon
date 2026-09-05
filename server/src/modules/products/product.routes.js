const express = require('express');
const router = express.Router();
const ctrl = require('./product.controller');
const { validateCreate, validateUpdate, validateUUID } = require('./product.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'PRODUCT_MANAGER']), validateCreate, ctrl.createProduct);
router.get('/', ctrl.getProducts);
router.get('/:id', validateUUID('id'), ctrl.getProductById);
router.put('/:id', validateUUID('id'), requireRole(['ADMIN', 'PRODUCT_MANAGER']), validateUpdate, ctrl.updateProduct);
router.delete('/:id', validateUUID('id'), requireRole(['ADMIN', 'PRODUCT_MANAGER']), ctrl.deleteProduct);

module.exports = router;
