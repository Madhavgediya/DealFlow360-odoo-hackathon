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
  if (user.company_id !== companyId) {
    const error = new Error('Cross-company access denied');
    error.statusCode = 403;
    error.code = 'CROSS_COMPANY_ACCESS_DENIED';
    throw error;
  }

  // 2. Verify Role exists and belongs to company
  const role = await roleRepository.getRoleByIdAndCompany(roleId, companyId);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    error.code = 'ROLE_NOT_FOUND';
    throw error;
  }

  // 3. Check duplicate assignment
  const exists = await userRoleRepository.checkUserRoleExists(userId, roleId);
  if (exists) {
    const error = new Error('Role already assigned to user');
    error.statusCode = 409;
    error.code = 'USER_ROLE_ALREADY_EXISTS';
    throw error;
  }

  return await userRoleRepository.assignRoleToUser(userId, roleId);
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
