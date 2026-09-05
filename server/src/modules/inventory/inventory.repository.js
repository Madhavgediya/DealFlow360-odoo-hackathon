const db = require('../../config/database');

const WAREHOUSE_FIELDS = `
  id, company_id, name, location, is_active, created_at
`;

const INVENTORY_FIELDS = `
  id, company_id, warehouse_id, product_id, quantity_on_hand, quantity_reserved
`;

const STOCK_MOVEMENT_FIELDS = `
  id, company_id, product_id, warehouse_id, movement_type, quantity, reference_type, reference_id, created_at
`;

// -- Warehouses --
const createWarehouse = async (data) => {
  const { company_id, name, location, is_active } = data;
  const query = `
    INSERT INTO warehouses (company_id, name, location, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING ${WAREHOUSE_FIELDS}
  `;
  const result = await db.query(query, [company_id, name, location || null, is_active !== false]);
  return result.rows[0];
};

const getWarehouses = async (company_id) => {
  const query = `SELECT ${WAREHOUSE_FIELDS} FROM warehouses WHERE company_id = $1 ORDER BY name ASC`;
  const result = await db.query(query, [company_id]);
  return result.rows;
};

const getWarehouseByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${WAREHOUSE_FIELDS} FROM warehouses WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

// -- Inventory (Stock Control) --

const getInventory = async (warehouse_id, company_id) => {
  const query = `
    SELECT i.*, p.name as product_name, p.sku 
    FROM inventory i
    JOIN products p ON p.id = i.product_id
    WHERE i.warehouse_id = $1 AND i.company_id = $2
  `;
  const result = await db.query(query, [warehouse_id, company_id]);
  return result.rows;
};

const getInventoryByProduct = async (warehouse_id, product_id, company_id) => {
  const query = `
    SELECT * FROM inventory
    WHERE warehouse_id = $1 AND product_id = $2 AND company_id = $3
  `;
  const result = await db.query(query, [warehouse_id, product_id, company_id]);
  return result.rows[0];
};

// TRANSACTIONAL STOCK OPERATIONS
const reserveStockTransaction = async (company_id, warehouse_id, product_id, quantity, reference_type, reference_id) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if movement already exists (idempotency)
    const existingMovementQuery = `
      SELECT id FROM stock_movements 
      WHERE company_id = $1 AND warehouse_id = $2 AND product_id = $3 AND reference_type = $4 AND reference_id = $5 AND movement_type = 'RESERVE'
    `;
    const existingMovement = await client.query(existingMovementQuery, [company_id, warehouse_id, product_id, reference_type, reference_id]);
    
    if (existingMovement.rows.length > 0) {
      await client.query('ROLLBACK');
      return { success: true, message: 'Stock already reserved', idempotent: true };
    }

    // Lock the inventory row for update to prevent concurrency race conditions
    let invRow = await client.query(
      `SELECT * FROM inventory WHERE company_id = $1 AND warehouse_id = $2 AND product_id = $3 FOR UPDATE`,
      [company_id, warehouse_id, product_id]
    );
    
    if (invRow.rows.length === 0) {
      throw new Error('Inventory record not found for product in warehouse');
    }
    
    const inventory = invRow.rows[0];
    const available = inventory.quantity_on_hand - inventory.quantity_reserved;
    
    if (available < quantity) {
      throw new Error(`Insufficient stock. Requested: ${quantity}, Available: ${available}`);
    }

    // Update reservation
    const updateInvQuery = `
      UPDATE inventory 
      SET quantity_reserved = quantity_reserved + $1 
      WHERE id = $2
      RETURNING *
    `;
    const updatedInv = await client.query(updateInvQuery, [quantity, inventory.id]);
    
    // Insert movement
    const insertMoveQuery = `
      INSERT INTO stock_movements (company_id, product_id, warehouse_id, movement_type, quantity, reference_type, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    await client.query(insertMoveQuery, [company_id, product_id, warehouse_id, 'RESERVE', quantity, reference_type, reference_id]);
    
    await client.query('COMMIT');
    return { success: true, inventory: updatedInv.rows[0] };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const addStockTransaction = async (company_id, warehouse_id, product_id, quantity, reference_type, reference_id) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Upsert inventory
    const upsertInvQuery = `
      INSERT INTO inventory (company_id, warehouse_id, product_id, quantity_on_hand, quantity_reserved)
      VALUES ($1, $2, $3, $4, 0)
      ON CONFLICT (warehouse_id, product_id) 
      DO UPDATE SET quantity_on_hand = inventory.quantity_on_hand + EXCLUDED.quantity_on_hand
      RETURNING *
    `;
    const invRow = await client.query(upsertInvQuery, [company_id, warehouse_id, product_id, quantity]);
    
    // Insert movement
    const insertMoveQuery = `
      INSERT INTO stock_movements (company_id, product_id, warehouse_id, movement_type, quantity, reference_type, reference_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    await client.query(insertMoveQuery, [company_id, product_id, warehouse_id, 'IN', quantity, reference_type, reference_id]);
    
    await client.query('COMMIT');
    return { success: true, inventory: invRow.rows[0] };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  createWarehouse,
  getWarehouses,
  getWarehouseByIdAndCompany,
  getInventory,
  getInventoryByProduct,
  reserveStockTransaction,
  addStockTransaction
};
