const db = require('../../config/database');

// Never include password_hash in safe selects
const SAFE_FIELDS = `id, company_id, first_name, last_name, name, email, phone, avatar_url, role, status, last_login_at, created_at, updated_at`;

const createUser = async (data) => {
  const { company_id, email, password_hash, phone, avatar_url, role, status } = data;
  const firstName = data.first_name || (data.name ? data.name.split(' ')[0] : 'User');
  const lastName = data.last_name || (data.name ? data.name.split(' ').slice(1).join(' ') : '');
  const name = data.name || [firstName, lastName].filter(Boolean).join(' ');

  const query = `
    INSERT INTO users (company_id, first_name, last_name, name, email, password_hash, phone, avatar_url, role, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING ${SAFE_FIELDS}
  `;
  const result = await db.query(query, [
    company_id, firstName, lastName, name, email, password_hash,
    phone, avatar_url, role || 'CUSTOMER', status || 'ACTIVE'
  ]);
  return result.rows[0];
};

const getUsersByCompany = async (company_id) => {
  let query = `
    SELECT 
      u.id, 
      u.company_id, 
      u.first_name, 
      u.last_name, 
      u.name, 
      u.email, 
      u.phone, 
      u.avatar_url, 
      u.role, 
      u.status, 
      u.last_login_at, 
      u.created_at, 
      u.updated_at,
      r.id as role_id,
      r.name as role_name,
      r.code as role_code,
      COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'module', p.module,
            'action', p.action,
            'resource', p.resource,
            'description', p.description
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) as permissions
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rp.permission_id
  `;
  const params = [];
  if (company_id) {
    query += ` WHERE u.company_id = $1`;
    params.push(company_id);
  }
  query += ` GROUP BY u.id, r.id, r.name, r.code ORDER BY u.created_at DESC`;
  const result = await db.query(query, params);
  return result.rows;
};

const getUserByIdAndCompany = async (id, company_id) => {
  const query = `
    SELECT 
      u.id, 
      u.company_id, 
      u.first_name, 
      u.last_name, 
      u.name, 
      u.email, 
      u.phone, 
      u.avatar_url, 
      u.role, 
      u.status, 
      u.last_login_at, 
      u.created_at, 
      u.updated_at,
      r.id as role_id,
      r.name as role_name,
      r.code as role_code,
      COALESCE(
        json_agg(
          json_build_object(
            'id', p.id,
            'module', p.module,
            'action', p.action,
            'resource', p.resource,
            'description', p.description
          )
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) as permissions
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = $1 ${company_id ? 'AND u.company_id = $2' : ''}
    GROUP BY u.id, r.id, r.name, r.code
  `;
  const params = company_id ? [id, company_id] : [id];
  const result = await db.query(query, params);
  return result.rows[0];
};

const getUserById = async (id) => {
  return getUserByIdAndCompany(id, null);
};

const getUserByEmail = async (email) => {
  const result = await db.query(`SELECT id, company_id, role, email FROM users WHERE email = $1`, [email]);
  return result.rows[0];
};

const updateUser = async (id, company_id, data) => {
  const allowedFields = ['first_name', 'last_name', 'name', 'phone', 'avatar_url', 'role', 'status'];
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
  
  let query = '';
  if (company_id) {
    values.push(id, company_id);
    query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} AND company_id = $${i + 1} RETURNING ${SAFE_FIELDS}`;
  } else {
    values.push(id);
    query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING ${SAFE_FIELDS}`;
  }

  const result = await db.query(query, values);
  return result.rows[0];
};

const updateUserStatus = async (id, company_id, status) => {
  let query = '';
  let values = [];
  if (company_id) {
    query = `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3 RETURNING ${SAFE_FIELDS}`;
    values = [status, id, company_id];
  } else {
    query = `UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING ${SAFE_FIELDS}`;
    values = [status, id];
  }
  const result = await db.query(query, values);
  return result.rows[0];
};

module.exports = { createUser, getUsersByCompany, getUserByIdAndCompany, getUserById, getUserByEmail, updateUser, updateUserStatus };

