const db = require('../../config/database');

const ORDER_FIELDS = `
  id, company_id, quotation_id, customer_id, status, total, created_at, updated_at
`;

const ORDER_LINE_FIELDS = `
  id, company_id, order_id, product_id, quantity, unit_price, line_total
`;

const createOrderTransaction = async (data) => {
  const { company_id, quotation_id, customer_id, total, lines } = data;
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create order
    const orderQuery = `
      INSERT INTO sales_orders (company_id, quotation_id, customer_id, total, status)
      VALUES ($1, $2, $3, $4, 'CONFIRMED')
      RETURNING ${ORDER_FIELDS}
    `;
    const orderRes = await client.query(orderQuery, [company_id, quotation_id, customer_id, total]);
    const order = orderRes.rows[0];
    
    // 2. Create lines
    const lineQuery = `
      INSERT INTO sales_order_lines (company_id, order_id, product_id, quantity, unit_price, line_total)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${ORDER_LINE_FIELDS}
    `;
    
    order.lines = [];
    for (const line of lines) {
      const lineRes = await client.query(lineQuery, [
        company_id, 
        order.id, 
        line.product_id, 
        line.quantity, 
        line.unit_price, 
        line.line_total
      ]);
      order.lines.push(lineRes.rows[0]);
    }
    
    // 3. Update quotation status
    await client.query(`
      UPDATE quotations SET status = 'APPROVED', updated_at = NOW() 
      WHERE id = $1 AND company_id = $2
    `, [quotation_id, company_id]);
    
    await client.query('COMMIT');
    return order;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getOrders = async (company_id, filters = {}) => {
  const conditions = ['company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.customer_id) {
    conditions.push(`customer_id = $${i}`);
    values.push(filters.customer_id);
    i++;
  }

  if (filters.status) {
    conditions.push(`status = $${i}`);
    values.push(filters.status);
    i++;
  }

  const query = `SELECT ${ORDER_FIELDS} FROM sales_orders WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getOrderByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${ORDER_FIELDS} FROM sales_orders WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const getOrderLines = async (order_id, company_id) => {
  const query = `
    SELECT ol.*, p.name as product_name, p.sku 
    FROM sales_order_lines ol
    JOIN products p ON p.id = ol.product_id
    WHERE ol.order_id = $1 AND ol.company_id = $2
  `;
  const result = await db.query(query, [order_id, company_id]);
  return result.rows;
};

const updateOrderStatus = async (id, company_id, status) => {
  const query = `
    UPDATE sales_orders 
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND company_id = $3
    RETURNING ${ORDER_FIELDS}
  `;
  const result = await db.query(query, [status, id, company_id]);
  return result.rows[0];
};

module.exports = {
  createOrderTransaction,
  getOrders,
  getOrderByIdAndCompany,
  getOrderLines,
  updateOrderStatus
};
