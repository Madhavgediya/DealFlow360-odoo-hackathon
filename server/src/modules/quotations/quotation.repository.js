const db = require('../../config/database');

const QUOTATION_FIELDS = `
  id, company_id, customer_id, opportunity_id, status, subtotal, discount_total, tax_total, total, valid_until, created_by, created_at, updated_at
`;

const QUOTATION_LINE_FIELDS = `
  id, company_id, quotation_id, product_id, quantity, unit_price, discount_percent, line_total
`;

const createQuotation = async (data) => {
  const { company_id, customer_id, opportunity_id, status, valid_until, created_by } = data;

  const query = `
    INSERT INTO quotations (
      company_id, customer_id, opportunity_id, status, valid_until, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ${QUOTATION_FIELDS}
  `;
  const values = [
    company_id,
    customer_id,
    opportunity_id || null,
    status || 'DRAFT',
    valid_until || null,
    created_by || null
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getQuotations = async (company_id, filters = {}) => {
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

  const query = `SELECT ${QUOTATION_FIELDS} FROM quotations WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`;
  const result = await db.query(query, values);
  return result.rows;
};

const getQuotationByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${QUOTATION_FIELDS} FROM quotations WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const updateQuotationTotals = async (id, company_id, totals) => {
  const query = `
    UPDATE quotations 
    SET subtotal = $1, discount_total = $2, tax_total = $3, total = $4, updated_at = NOW()
    WHERE id = $5 AND company_id = $6
    RETURNING ${QUOTATION_FIELDS}
  `;
  const values = [
    totals.subtotal, 
    totals.discount_total, 
    totals.tax_total, 
    totals.total, 
    id, 
    company_id
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateQuotationStatus = async (id, company_id, status) => {
  const query = `
    UPDATE quotations 
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND company_id = $3
    RETURNING ${QUOTATION_FIELDS}
  `;
  const result = await db.query(query, [status, id, company_id]);
  return result.rows[0];
};

// Quotation Lines
const addQuotationLine = async (data) => {
  const { company_id, quotation_id, product_id, quantity, unit_price, discount_percent, line_total } = data;
  
  const query = `
    INSERT INTO quotation_lines (
      company_id, quotation_id, product_id, quantity, unit_price, discount_percent, line_total
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING ${QUOTATION_LINE_FIELDS}
  `;
  const values = [
    company_id,
    quotation_id,
    product_id,
    quantity,
    unit_price,
    discount_percent,
    line_total
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getQuotationLines = async (quotation_id, company_id) => {
  const query = `
    SELECT ql.*, p.name as product_name, p.sku 
    FROM quotation_lines ql
    JOIN products p ON p.id = ql.product_id
    WHERE ql.quotation_id = $1 AND ql.company_id = $2
  `;
  const result = await db.query(query, [quotation_id, company_id]);
  return result.rows;
};

const deleteQuotationLine = async (id, quotation_id, company_id) => {
  const result = await db.query(
    `DELETE FROM quotation_lines WHERE id = $1 AND quotation_id = $2 AND company_id = $3 RETURNING id`,
    [id, quotation_id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationByIdAndCompany,
  updateQuotationTotals,
  updateQuotationStatus,
  addQuotationLine,
  getQuotationLines,
  deleteQuotationLine
};
