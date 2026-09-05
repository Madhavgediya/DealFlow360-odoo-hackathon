const db = require('../../config/database');

const SAFE_FIELDS = 'id, name, legal_name, code, email, phone, country, timezone, default_currency_id, status, created_at, updated_at';

const createCompany = async (data) => {
  const { name, legal_name, code, email, phone, country, timezone, default_currency_id, status } = data;
  const query = `
    INSERT INTO companies (name, legal_name, code, email, phone, country, timezone, default_currency_id, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING ${SAFE_FIELDS}
  `;
  const result = await db.query(query, [name, legal_name, code, email, phone, country, timezone, default_currency_id, status || 'ACTIVE']);
  return result.rows[0];
};

const getCompanies = async () => {
  const result = await db.query(`SELECT ${SAFE_FIELDS} FROM companies ORDER BY created_at DESC`);
  return result.rows;
};

const getCompanyById = async (id) => {
  const result = await db.query(`SELECT ${SAFE_FIELDS} FROM companies WHERE id = $1`, [id]);
  return result.rows[0];
};

const getCompanyByCode = async (code) => {
  const result = await db.query(`SELECT id FROM companies WHERE code = $1`, [code]);
  return result.rows[0];
};

const updateCompany = async (id, data) => {
  const allowedFields = ['name', 'legal_name', 'code', 'email', 'phone', 'country', 'timezone', 'default_currency_id'];
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

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `UPDATE companies SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${SAFE_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateCompanyStatus = async (id, status) => {
  const result = await db.query(
    `UPDATE companies SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING ${SAFE_FIELDS}`,
    [status, id]
  );
  return result.rows[0];
};

module.exports = { createCompany, getCompanies, getCompanyById, getCompanyByCode, updateCompany, updateCompanyStatus };
