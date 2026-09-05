const express = require('express');
const router = express.Router();
const ctrl = require('./inventory.controller');
const { validateCreateWarehouse, validateStockMovement, validateUUID } = require('./inventory.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

// Warehouses
router.post('/warehouses', requireRole(['ADMIN', 'INVENTORY_MANAGER']), validateCreateWarehouse, ctrl.createWarehouse);
router.get('/warehouses', ctrl.getWarehouses);
router.get('/warehouses/:id', validateUUID('id'), ctrl.getWarehouseById);

// Inventory / Stock
router.get('/warehouses/:id/inventory', validateUUID('id'), ctrl.getInventory);
router.post('/warehouses/:id/stock/add', validateUUID('id'), requireRole(['ADMIN', 'INVENTORY_MANAGER']), validateStockMovement, ctrl.addStock);
router.post('/warehouses/:id/stock/reserve', validateUUID('id'), requireRole(['ADMIN', 'INVENTORY_MANAGER', 'SALES_REP', 'SALES_MANAGER']), validateStockMovement, ctrl.reserveStock);

module.exports = router;
