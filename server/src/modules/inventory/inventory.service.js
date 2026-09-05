const inventoryRepository = require('./inventory.repository');
const productRepository = require('../products/product.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

// -- Warehouses --

const createWarehouse = async (data, companyId) => {
  return inventoryRepository.createWarehouse({ ...data, company_id: companyId });
};

const getWarehouses = async (companyId) => {
  return inventoryRepository.getWarehouses(companyId);
};

const getWarehouseById = async (id, companyId) => {
  const warehouse = await inventoryRepository.getWarehouseByIdAndCompany(id, companyId);
  if (!warehouse) throw createAppError('Warehouse not found', 404, 'WAREHOUSE_NOT_FOUND');
  return warehouse;
};

// -- Inventory / Stock --

const getInventory = async (warehouseId, companyId) => {
  await getWarehouseById(warehouseId, companyId);
  return inventoryRepository.getInventory(warehouseId, companyId);
};

const addStock = async (warehouseId, data, companyId) => {
  await getWarehouseById(warehouseId, companyId);
  
  const product = await productRepository.getProductByIdAndCompany(data.product_id, companyId);
  if (!product) throw createAppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  return inventoryRepository.addStockTransaction(
    companyId,
    warehouseId,
    data.product_id,
    data.quantity,
    data.reference_type || 'MANUAL_ADJUSTMENT',
    data.reference_id || null
  );
};

const reserveStock = async (warehouseId, data, companyId) => {
  await getWarehouseById(warehouseId, companyId);
  
  const product = await productRepository.getProductByIdAndCompany(data.product_id, companyId);
  if (!product) throw createAppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  try {
    return await inventoryRepository.reserveStockTransaction(
      companyId,
      warehouseId,
      data.product_id,
      data.quantity,
      data.reference_type || 'MANUAL_RESERVATION',
      data.reference_id || null
    );
  } catch (err) {
    if (err.message.includes('Insufficient stock')) {
      throw createAppError(err.message, 422, 'INSUFFICIENT_STOCK');
    }
    throw err;
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  getInventory,
  addStock,
  reserveStock
};
