const db = require('../../config/database');

const createUser = async (userData) => {
  const { name, email, password_hash, role } = userData;
  
  // Create a default company for the new user (minimal tenancy)
  const companyQuery = `INSERT INTO companies (name) VALUES ($1) RETURNING id`;
  const companyResult = await db.query(companyQuery, [`${name}'s Company`]);
  const companyId = companyResult.rows[0].id;

  const query = `
    INSERT INTO users (name, email, password_hash, role, company_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, role, company_id, status, created_at, updated_at
  `;
  const values = [name, email, password_hash, role, companyId];
  const result = await db.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  const result = await db.query(query, [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const query = `
    SELECT id, name, email, role, company_id, status, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
