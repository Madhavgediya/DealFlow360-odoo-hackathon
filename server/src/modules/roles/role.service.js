const roleRepository = require('./role.repository');

const createRole = async (roleData, companyId) => {
  // Check if role code already exists in this company
  const existingRole = await roleRepository.getRoleByCodeAndCompany(roleData.code, companyId);
  if (existingRole) {
    const error = new Error('A role with this code already exists');
    error.statusCode = 409;
    error.code = 'ROLE_ALREADY_EXISTS';
    throw error;
  }

  const newRole = await roleRepository.createRole({
    ...roleData,
    company_id: companyId
  });

  return newRole;
};

const getRoles = async (companyId) => {
  return await roleRepository.getRolesByCompanyId(companyId);
};

const getRoleById = async (id, companyId) => {
  const role = await roleRepository.getRoleByIdAndCompany(id, companyId);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    error.code = 'ROLE_NOT_FOUND';
    throw error;
  }
  return role;
};

const updateRole = async (id, companyId, updateData) => {
  // Check if role exists and belongs to company
  const role = await roleRepository.getRoleByIdAndCompany(id, companyId);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    error.code = 'ROLE_NOT_FOUND';
    throw error;
  }

  // Check code conflict if code is updated
  if (updateData.code && updateData.code !== role.code) {
    const existingRole = await roleRepository.getRoleByCodeAndCompany(updateData.code, companyId);
    if (existingRole) {
      const error = new Error('A role with this code already exists');
      error.statusCode = 409;
      error.code = 'ROLE_ALREADY_EXISTS';
      throw error;
    }
  }

  return await roleRepository.updateRole(id, companyId, updateData);
};

const deleteRole = async (id, companyId) => {
  // Verify ownership
  const role = await roleRepository.getRoleByIdAndCompany(id, companyId);
  if (!role) {
    const error = new Error('Role not found');
    error.statusCode = 404;
    error.code = 'ROLE_NOT_FOUND';
    throw error;
  }

  // Check if role is in use
  const usersCount = await roleRepository.countUsersWithRole(id);
  if (usersCount > 0) {
    const error = new Error('Role is currently assigned to users and cannot be deleted');
    error.statusCode = 409;
    error.code = 'ROLE_IN_USE';
    throw error;
  }

  await roleRepository.deleteRole(id, companyId);
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole
};
