const db = require('../../config/database');

const SAFE_FIELDS = 'id, name, legal_name, code, email, phone, country, timezone, default_currency_id, status, business_type, created_at, updated_at';

const createCompanyWithAdmin = async (companyData, adminData) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // 1. Create company
    const { name, legal_name, code, email, phone, country, timezone, default_currency_id, status, business_type } = companyData;
    const compQuery = `
      INSERT INTO companies (name, legal_name, code, email, phone, country, timezone, default_currency_id, status, business_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING ${SAFE_FIELDS}
    `;
    const compRes = await client.query(compQuery, [
      name,
      legal_name || null,
      code,
      email || null,
      phone || null,
      country || null,
      timezone || null,
      default_currency_id || null,
      status || 'ACTIVE',
      business_type || 'BOTH'
    ]);
    const company = compRes.rows[0];


    // 2. Create default Admin role
    const roleQuery = `INSERT INTO roles (company_id, name, code, description) VALUES ($1, 'Admin', 'ADMIN', 'Administrator') RETURNING id`;
    const roleRes = await client.query(roleQuery, [company.id]);
    const adminRoleId = roleRes.rows[0].id;

    // (Optionally assign all available permissions to this ADMIN role here, or let the user do it via UI)
    const permQuery = `SELECT id FROM permissions`;
    const perms = await client.query(permQuery);
    if (perms.rows.length > 0) {
      const rpValues = perms.rows.map(p => `('${adminRoleId}', '${p.id}')`).join(',');
      await client.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ${rpValues}`);
    }

    // 3. Create Admin user
    const userQuery = `
      INSERT INTO users (company_id, email, password_hash, first_name, last_name, role, name, status)
      VALUES ($1, $2, $3, $4, $5, 'ADMIN', $6, 'ACTIVE')
      RETURNING id, name, email, role, status
    `;
    const userRes = await client.query(userQuery, [
      company.id,
      adminData.email.toLowerCase().trim(),
      adminData.password_hash,
      adminData.firstName || 'Admin',
      adminData.lastName || 'User',
      adminData.name || 'Company Admin'
    ]);
    const adminUser = userRes.rows[0];

    // 4. Map user to role
    await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [adminUser.id, adminRoleId]);

    await client.query('COMMIT');
    
    return { ...company, admin_user: adminUser };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
  const allowedFields = ['name', 'legal_name', 'code', 'email', 'phone', 'country', 'timezone', 'default_currency_id', 'business_type'];
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

module.exports = { createCompanyWithAdmin, getCompanies, getCompanyById, getCompanyByCode, updateCompany, updateCompanyStatus };
