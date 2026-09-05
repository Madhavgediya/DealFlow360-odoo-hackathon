const db = require('../../config/database');

const INVOICE_FIELDS = `
  id, company_id, order_id, customer_id, status, subtotal, tax_total, total, due_date, created_at, updated_at
`;

const INVOICE_LINE_FIELDS = `
  id, company_id, invoice_id, product_id, quantity, unit_price, line_total
`;

const createInvoiceTransaction = async (data) => {
  const { company_id, order_id, customer_id, subtotal, tax_total, total, lines } = data;
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Create invoice
    const invQuery = `
      INSERT INTO invoices (company_id, order_id, customer_id, status, subtotal, tax_total, total)
      VALUES ($1, $2, $3, 'DRAFT', $4, $5, $6)
      RETURNING ${INVOICE_FIELDS}
    `;
    const invRes = await client.query(invQuery, [company_id, order_id, customer_id, subtotal, tax_total, total]);
    const invoice = invRes.rows[0];
    
    // 2. Create lines
    const lineQuery = `
      INSERT INTO invoice_lines (company_id, invoice_id, product_id, quantity, unit_price, line_total)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${INVOICE_LINE_FIELDS}
    `;
    
    invoice.lines = [];
    for (const line of lines) {
      const lineRes = await client.query(lineQuery, [
        company_id, 
        invoice.id, 
        line.product_id, 
        line.quantity, 
        line.unit_price, 
        line.line_total
      ]);
      invoice.lines.push(lineRes.rows[0]);
    }
    
    await client.query('COMMIT');
    return invoice;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getInvoices = async (company_id, filters = {}) => {
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

  const query = `SELECT ${INVOICE_FIELDS} FROM invoices WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getInvoiceByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${INVOICE_FIELDS} FROM invoices WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const getInvoiceLines = async (invoice_id, company_id) => {
  const query = `
    SELECT il.*, p.name as product_name, p.sku 
    FROM invoice_lines il
    JOIN products p ON p.id = il.product_id
    WHERE il.invoice_id = $1 AND il.company_id = $2
  `;
  const result = await db.query(query, [invoice_id, company_id]);
  return result.rows;
};

const updateInvoiceStatus = async (id, company_id, status, due_date = null) => {
  let query = `
    UPDATE invoices 
    SET status = $1, updated_at = NOW()
  `;
  const values = [status];
  let i = 2;

  if (due_date) {
    query += `, due_date = $${i}`;
    values.push(due_date);
    i++;
  }

  query += ` WHERE id = $${i} AND company_id = $${i+1} RETURNING ${INVOICE_FIELDS}`;
  values.push(id, company_id);

  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = {
  createInvoiceTransaction,
  getInvoices,
  getInvoiceByIdAndCompany,
  getInvoiceLines,
  updateInvoiceStatus
};
