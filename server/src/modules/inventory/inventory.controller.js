const inventoryService = require('./inventory.service');

const createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await inventoryService.createWarehouse(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: warehouse });
  } catch (err) { next(err); }
};

const getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await inventoryService.getWarehouses(req.user.company_id);
    res.status(200).json({ success: true, data: warehouses });
  } catch (err) { next(err); }
};

const getWarehouseById = async (req, res, next) => {
  try {
    const warehouse = await inventoryService.getWarehouseById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: warehouse });
  } catch (err) { next(err); }
};

const getInventory = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getInventory(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: inventory });
  } catch (err) { next(err); }
};

const addStock = async (req, res, next) => {
  try {
    const result = await inventoryService.addStock(req.params.id, req.body, req.user.company_id);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

const reserveStock = async (req, res, next) => {
  try {
    const result = await inventoryService.reserveStock(req.params.id, req.body, req.user.company_id);
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  getInventory,
  addStock,
  reserveStock
};
