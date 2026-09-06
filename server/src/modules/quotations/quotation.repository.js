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
  const conditions = [];
  const values = [];
  let i = 1;

  if (company_id) {
    conditions.push(`q.company_id = $${i}`);
    values.push(company_id);
    i++;
  }

  if (filters.customer_id) {
    conditions.push(`q.customer_id = $${i}`);
    values.push(filters.customer_id);
    i++;
  }

  if (filters.status && filters.status !== 'ALL') {
    conditions.push(`q.status = $${i}`);
    values.push(filters.status);
    i++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      q.id, q.company_id, q.customer_id, q.opportunity_id, q.status, 
      q.subtotal, q.discount_total, q.tax_total, q.total, q.valid_until, 
      q.created_by, q.created_at, q.updated_at,
      c.name as customer_name,
      u.name as salesperson_name,
      comp.name as company_name
    FROM quotations q
    LEFT JOIN customers c ON c.id = q.customer_id
    LEFT JOIN users u ON u.id = q.created_by
    LEFT JOIN companies comp ON comp.id = q.company_id
    ${whereClause} 
    ORDER BY q.created_at DESC
  `;
  const result = await db.query(query, values);
  return result.rows;
};

const getQuotationByIdAndCompany = async (id, company_id) => {
  const query = `
    SELECT 
      q.id, q.company_id, q.customer_id, q.opportunity_id, q.status, 
      q.subtotal, q.discount_total, q.tax_total, q.total, q.valid_until, 
      q.created_by, q.created_at, q.updated_at,
      c.name as customer_name,
      u.name as salesperson_name,
      comp.name as company_name
    FROM quotations q
    LEFT JOIN customers c ON c.id = q.customer_id
    LEFT JOIN users u ON u.id = q.created_by
    LEFT JOIN companies comp ON comp.id = q.company_id
    WHERE q.id = $1 ${company_id ? 'AND q.company_id = $2' : ''}
  `;
  const params = company_id ? [id, company_id] : [id];
  const result = await db.query(query, params);
  return result.rows[0];
};

const updateQuotation = async (id, company_id, data) => {
  const allowedFields = ['customer_id', 'opportunity_id', 'status', 'valid_until'];
  const fields = [];
  const values = [];
  let i = 1;

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(data[key]);
      i++;
    }
  }

  fields.push('updated_at = NOW()');
  values.push(id, company_id);

  const query = `
    UPDATE quotations
    SET ${fields.join(', ')}
    WHERE id = $${i} AND company_id = $${i + 1}
    RETURNING ${QUOTATION_FIELDS}
  `;
  const result = await db.query(query, values);
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

const deleteQuotation = async (id, company_id) => {
  const result = await db.query(
    `DELETE FROM quotations WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, company_id]
  );
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
    WHERE ql.quotation_id = $1 ${company_id ? 'AND ql.company_id = $2' : ''}
  `;
  const params = company_id ? [quotation_id, company_id] : [quotation_id];
  const result = await db.query(query, params);
  return result.rows;
};

const deleteQuotationLine = async (id, quotation_id, company_id) => {
  const result = await db.query(
    `DELETE FROM quotation_lines WHERE id = $1 AND quotation_id = $2 AND company_id = $3 RETURNING id`,
    [id, quotation_id, company_id]
  );
  return result.rows[0];
};

const clearQuotationLines = async (quotation_id, company_id) => {
  await db.query(
    `DELETE FROM quotation_lines WHERE quotation_id = $1 AND company_id = $2`,
    [quotation_id, company_id]
  );
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationByIdAndCompany,
  updateQuotation,
  updateQuotationTotals,
  updateQuotationStatus,
  deleteQuotation,
  addQuotationLine,
  getQuotationLines,
  deleteQuotationLine,
  clearQuotationLines
};
