const userRoleRepository = require('./userRole.repository');
const authRepository = require('../auth/auth.repository');
const roleRepository = require('../roles/role.repository');

const assignRole = async (userId, roleId, companyId) => {
  // 1. Verify User exists and belongs to company
  const user = await authRepository.findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  if (user.company_id && companyId && user.company_id !== companyId) {
    const error = new Error('Cross-company access denied');
    error.statusCode = 403;
    error.code = 'CROSS_COMPANY_ACCESS_DENIED';
    throw error;
  }

  // 2. Verify Role exists and belongs to company or is system role
  const role = await roleRepository.getRoleByIdAndCompany(roleId, companyId || user.company_id);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    error.code = 'ROLE_NOT_FOUND';
    throw error;
  }

  // 3. Assign role and sync user's role column
  const db = require('../../config/database');
  await db.query('DELETE FROM user_roles WHERE user_id = $1', [userId]);
  const result = await db.query(
    'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
    [userId, roleId]
  );
  if (role.code) {
    await db.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [role.code, userId]);
  }

  return result.rows[0] || { user_id: userId, role_id: roleId, role };
};

const getUserRoles = async (userId, companyId) => {
  // 1. Verify User exists and belongs to company
  const user = await authRepository.findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  if (user.company_id !== companyId) {
    const error = new Error('Cross-company access denied');
    error.statusCode = 403;
    error.code = 'CROSS_COMPANY_ACCESS_DENIED';
    throw error;
  }

  return await userRoleRepository.getUserRoles(userId);
};

const removeRole = async (userId, roleId, companyId) => {
  // 1. Verify User exists and belongs to company
  const user = await authRepository.findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  if (user.company_id !== companyId) {
    const error = new Error('Cross-company access denied');
    error.statusCode = 403;
    error.code = 'CROSS_COMPANY_ACCESS_DENIED';
    throw error;
  }

  // 2. Check assignment exists
  const exists = await userRoleRepository.checkUserRoleExists(userId, roleId);
  if (!exists) {
    const error = new Error('User role assignment not found');
    error.statusCode = 404;
    error.code = 'USER_ROLE_NOT_FOUND';
    throw error;
  }

  await userRoleRepository.removeRoleFromUser(userId, roleId);
};

module.exports = {
  assignRole,
  getUserRoles,
  removeRole
};
