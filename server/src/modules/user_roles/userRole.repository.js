const db = require('../../config/database');

const assignRoleToUser = async (userId, roleId) => {
  const query = `
    INSERT INTO user_roles (user_id, role_id)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await db.query(query, [userId, roleId]);
  return result.rows[0];
};

const getUserRoles = async (userId) => {
  const query = `
    SELECT r.*
    FROM roles r
    JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = $1
    ORDER BY r.name
  `;
  const result = await db.query(query, [userId]);
  return result.rows;
};

const removeRoleFromUser = async (userId, roleId) => {
  const query = `
    DELETE FROM user_roles
    WHERE user_id = $1 AND role_id = $2
    RETURNING *
  `;
  const result = await db.query(query, [userId, roleId]);
  return result.rows[0];
};

const checkUserRoleExists = async (userId, roleId) => {
  const query = `
    SELECT 1 FROM user_roles
    WHERE user_id = $1 AND role_id = $2
  `;
  const result = await db.query(query, [userId, roleId]);
  return result.rows.length > 0;
};

module.exports = {
  assignRoleToUser,
  getUserRoles,
  removeRoleFromUser,
  checkUserRoleExists
};
