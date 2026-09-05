const db = require('../../config/database');

const createPermission = async (permissionData) => {
  const { module, action, resource, description } = permissionData;
  const query = `
    INSERT INTO permissions (module, action, resource, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [module, action, resource, description];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getPermissions = async () => {
  const query = `SELECT * FROM permissions ORDER BY module, resource, action`;
  const result = await db.query(query);
  return result.rows;
};

const getPermissionById = async (id) => {
  const query = `SELECT * FROM permissions WHERE id = $1`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const getPermissionByLogicalKey = async (module, action, resource) => {
  const query = `SELECT * FROM permissions WHERE module = $1 AND action = $2 AND resource = $3`;
  const result = await db.query(query, [module, action, resource]);
  return result.rows[0];
};

const updatePermission = async (id, updateData) => {
  const fields = [];
  const values = [];
  let i = 1;
  
  for (const [key, value] of Object.entries(updateData)) {
    fields.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }
  
  values.push(id);
  
  const query = `
    UPDATE permissions 
    SET ${fields.join(', ')} 
    WHERE id = $${i}
    RETURNING *
  `;
  const result = await db.query(query, values);
  return result.rows[0];
};

const deletePermission = async (id) => {
  const query = `DELETE FROM permissions WHERE id = $1 RETURNING id`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createPermission,
  getPermissions,
  getPermissionById,
  getPermissionByLogicalKey,
  updatePermission,
  deletePermission
};
