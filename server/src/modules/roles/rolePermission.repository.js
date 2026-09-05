const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const getPermissionsForRole = async (roleId) => {
  const query = `
    SELECT p.* 
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    WHERE rp.role_id = $1
  `;
  const result = await pool.query(query, [roleId]);
  return result.rows;
};

const assignPermissionsToRole = async (roleId, permissionIds) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Wipe existing permissions for this role
    await client.query('DELETE FROM role_permissions WHERE role_id = $1', [roleId]);
    
    // Insert new permissions
    if (permissionIds && permissionIds.length > 0) {
      // Use parameterized query building for bulk insert
      const values = [];
      const placeholders = [];
      
      permissionIds.forEach((permId, index) => {
        values.push(roleId, permId);
        placeholders.push(`($${index * 2 + 1}, $${index * 2 + 2})`);
      });
      
      const insertQuery = `
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES ${placeholders.join(', ')}
      `;
      
      await client.query(insertQuery, values);
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getUserPermissions = async (userId) => {
  const query = `
    SELECT DISTINCT p.* 
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = $1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

module.exports = {
  getPermissionsForRole,
  assignPermissionsToRole,
  getUserPermissions
};
