const roleService = require('./role.service');

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body, req.user.company_id);
    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getRoles(req.user.company_id);
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id, req.user.company_id);
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.user.company_id, req.body);
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id, req.user.company_id);
    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getRolePermissions = async (req, res, next) => {
  try {
    const rolePermissionRepo = require('./rolePermission.repository');
    // Ensure the user is from the same company as the role first
    await roleService.getRoleById(req.params.id, req.user.company_id);
    
    const permissions = await rolePermissionRepo.getPermissionsForRole(req.params.id);
    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    next(error);
  }
};

const updateRolePermissions = async (req, res, next) => {
  try {
    const { permissionIds } = req.body;
    const rolePermissionRepo = require('./rolePermission.repository');
    // Ensure the user is from the same company as the role first
    await roleService.getRoleById(req.params.id, req.user.company_id);
    
    await rolePermissionRepo.assignPermissionsToRole(req.params.id, permissionIds || []);
    
    // Fetch updated permissions to return
    const updatedPermissions = await rolePermissionRepo.getPermissionsForRole(req.params.id);
    
    res.json({
      success: true,
      message: 'Role permissions updated successfully',
      data: updatedPermissions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions
};
