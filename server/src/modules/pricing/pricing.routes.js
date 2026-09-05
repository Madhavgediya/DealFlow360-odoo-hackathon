const express = require('express');
const router = express.Router();
const ctrl = require('./pricing.controller');
const { validateCreatePriceList, validateUpdatePriceList, validateAddPriceListItem, validateUUID } = require('./pricing.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'SALES_MANAGER']), validateCreatePriceList, ctrl.createPriceList);
router.get('/', ctrl.getPriceLists);
router.get('/:id', validateUUID('id'), ctrl.getPriceListById);
router.put('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER']), validateUpdatePriceList, ctrl.updatePriceList);

// Price List Items
router.post('/:id/items', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER']), validateAddPriceListItem, ctrl.addPriceListItem);
router.get('/:id/items', validateUUID('id'), ctrl.getPriceListItems);

module.exports = router;
