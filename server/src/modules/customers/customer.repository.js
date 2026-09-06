const db = require('../../config/database');

const CUSTOMER_FIELDS = `
  id, company_id, name, industry, website, address, status,
  created_at, updated_at
`;

const createCustomer = async (data) => {
  const { company_id, name, industry, website, address, status } = data;

  const query = `
    INSERT INTO customers (
      company_id, name, industry, website, address, status
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ${CUSTOMER_FIELDS}
  `;
  const values = [
    company_id,
    name,
    industry || null,
    website || null,
    address || null,
    status || 'ACTIVE'
  ];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getCustomers = async (company_id, filters = {}) => {
  const conditions = ['company_id = $1'];
  const values = [company_id];
  let i = 2;

  if (filters.status) {
    conditions.push(`status = $${i}`);
    values.push(filters.status);
    i++;
  }

  const query = `SELECT ${CUSTOMER_FIELDS} FROM customers WHERE ${conditions.join(' AND ')} ORDER BY name ASC`;
  const result = await db.query(query, values);
  return result.rows;
};

const { resolveValidCompanyId, uuidRegex } = require('../../utils/companyResolver');

const getCustomerByIdAndCompany = async (id, company_id) => {
  if (!uuidRegex.test(id)) return null;
  const resolvedCompanyId = await resolveValidCompanyId(company_id);
  const result = await db.query(
    `SELECT ${CUSTOMER_FIELDS} FROM customers WHERE id = $1 AND (company_id = $2 OR company_id IS NULL OR company_id = (SELECT id FROM companies ORDER BY created_at ASC LIMIT 1))`,
    [id, resolvedCompanyId]
  );
  return result.rows[0];
};

const getCustomerById = async (id) => {
  if (!uuidRegex.test(id)) return null;
  const result = await db.query(
    `SELECT ${CUSTOMER_FIELDS} FROM customers WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateCustomer = async (id, company_id, data) => {
  const allowedFields = ['name', 'industry', 'website', 'address', 'status'];
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

  if (fields.length === 0) return getCustomerByIdAndCompany(id, company_id);

  fields.push(`updated_at = NOW()`);
  values.push(id, company_id);

  const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${CUSTOMER_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteCustomer = async (id, company_id) => {
  const result = await db.query(
    `DELETE FROM customers WHERE id = $1 AND company_id = $2 RETURNING id`,
    [id, company_id]
  );
  return result.rows[0];
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerByIdAndCompany,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
