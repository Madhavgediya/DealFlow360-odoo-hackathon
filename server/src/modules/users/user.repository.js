const db = require('../../config/database');

// Never include password_hash in safe selects
const SAFE_FIELDS = `id, company_id, first_name, last_name, email, phone, avatar_url, role, status, last_login_at, created_at, updated_at`;

const createUser = async (data) => {
  const { company_id, first_name, last_name, email, password_hash, phone, avatar_url, role, status } = data;
  const query = `
    INSERT INTO users (company_id, first_name, last_name, name, email, password_hash, phone, avatar_url, role, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING ${SAFE_FIELDS}
  `;
  const name = [first_name, last_name].filter(Boolean).join(' ');
  const result = await db.query(query, [
    company_id, first_name, last_name, name, email, password_hash,
    phone, avatar_url, role || 'CUSTOMER', status || 'ACTIVE'
  ]);
  return result.rows[0];
};

const getUsersByCompany = async (company_id) => {
  const result = await db.query(
    `SELECT ${SAFE_FIELDS} FROM users WHERE company_id = $1 ORDER BY created_at DESC`,
    [company_id]
  );
  return result.rows;
};

const getUserByIdAndCompany = async (id, company_id) => {
  const result = await db.query(
    `SELECT ${SAFE_FIELDS} FROM users WHERE id = $1 AND company_id = $2`,
    [id, company_id]
  );
  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await db.query(
    `SELECT ${SAFE_FIELDS} FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
  return result.rows[0];
};

const updateUser = async (id, company_id, data) => {
  const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
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

  // Also update the legacy `name` column for consistency
  if (data.first_name !== undefined || data.last_name !== undefined) {
    // will be computed in service
  }

  fields.push(`updated_at = NOW()`);
  values.push(id, company_id);

  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${SAFE_FIELDS}`;
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateUserStatus = async (id, company_id, status) => {
  const result = await db.query(
    `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3 RETURNING ${SAFE_FIELDS}`,
    [status, id, company_id]
  );
  return result.rows[0];
};

module.exports = { createUser, getUsersByCompany, getUserByIdAndCompany, getUserById, getUserByEmail, updateUser, updateUserStatus };
