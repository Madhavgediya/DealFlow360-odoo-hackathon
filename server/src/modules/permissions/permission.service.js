const permissionRepository = require('./permission.repository');

const createPermission = async (permissionData) => {
  // Check for duplicate logical permission
  const existing = await permissionRepository.getPermissionByLogicalKey(
    permissionData.module,
    permissionData.action,
    permissionData.resource
  );
  if (existing) {
    const error = new Error('A permission with this module, action, and resource already exists');
    error.statusCode = 409;
    error.code = 'PERMISSION_ALREADY_EXISTS';
    throw error;
  }

  return await permissionRepository.createPermission(permissionData);
};

const getPermissions = async () => {
  return await permissionRepository.getPermissions();
};

const getPermissionById = async (id) => {
  const permission = await permissionRepository.getPermissionById(id);
  if (!permission) {
    const error = new Error('Permission not found');
    error.statusCode = 404;
    error.code = 'PERMISSION_NOT_FOUND';
    throw error;
  }
  return permission;
};

const updatePermission = async (id, updateData) => {
  const permission = await permissionRepository.getPermissionById(id);
  if (!permission) {
    const error = new Error('Permission not found');
    error.statusCode = 404;
    error.code = 'PERMISSION_NOT_FOUND';
    throw error;
  }

  // Check uniqueness if logical key is changed
  const newModule = updateData.module || permission.module;
  const newAction = updateData.action || permission.action;
  const newResource = updateData.resource || permission.resource;

  if (newModule !== permission.module || newAction !== permission.action || newResource !== permission.resource) {
    const existing = await permissionRepository.getPermissionByLogicalKey(newModule, newAction, newResource);
    if (existing && existing.id !== id) {
      const error = new Error('A permission with this module, action, and resource already exists');
      error.statusCode = 409;
      error.code = 'PERMISSION_ALREADY_EXISTS';
      throw error;
    }
  }

  return await permissionRepository.updatePermission(id, updateData);
};

const deletePermission = async (id) => {
  const permission = await permissionRepository.getPermissionById(id);
  if (!permission) {
    const error = new Error('Permission not found');
    error.statusCode = 404;
    error.code = 'PERMISSION_NOT_FOUND';
    throw error;
  }

  await permissionRepository.deletePermission(id);
};

module.exports = {
  createPermission,
  getPermissions,
  getPermissionById,
  updatePermission,
  deletePermission
};
