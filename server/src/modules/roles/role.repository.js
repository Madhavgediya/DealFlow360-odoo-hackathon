const db = require('../../config/database');

const createRole = async (roleData) => {
  const { company_id, name, code, description, is_system } = roleData;
  const query = `
    INSERT INTO roles (company_id, name, code, description, is_system)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [company_id, name, code, description, is_system || false];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getRolesByCompanyId = async (company_id) => {
  const query = `SELECT * FROM roles WHERE company_id = $1 ORDER BY created_at DESC`;
  const result = await db.query(query, [company_id]);
  return result.rows;
};

const getRoleByIdAndCompany = async (id, company_id) => {
  const query = `SELECT * FROM roles WHERE id = $1 AND company_id = $2`;
  const result = await db.query(query, [id, company_id]);
  return result.rows[0];
};

const getRoleByCodeAndCompany = async (code, company_id) => {
  const query = `SELECT * FROM roles WHERE code = $1 AND company_id = $2`;
  const result = await db.query(query, [code, company_id]);
  return result.rows[0];
};

const updateRole = async (id, company_id, updateData) => {
  const fields = [];
  const values = [];
  let i = 1;
  
  for (const [key, value] of Object.entries(updateData)) {
    fields.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }
  
  values.push(id, company_id);
  
  const query = `
    UPDATE roles 
    SET ${fields.join(', ')} 
    WHERE id = $${i} AND company_id = $${i + 1}
    RETURNING *
  `;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteRole = async (id, company_id) => {
  const query = `DELETE FROM roles WHERE id = $1 AND company_id = $2 RETURNING id`;
  const result = await db.query(query, [id, company_id]);
  return result.rows[0];
};

const countUsersWithRole = async (role_id) => {
  const query = `SELECT COUNT(*) FROM user_roles WHERE role_id = $1`;
  const result = await db.query(query, [role_id]);
  return parseInt(result.rows[0].count, 10);
};

module.exports = {
  createRole,
  getRolesByCompanyId,
  getRoleByIdAndCompany,
  getRoleByCodeAndCompany,
  updateRole,
  deleteRole,
  countUsersWithRole
};
