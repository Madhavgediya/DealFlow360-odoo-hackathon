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
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
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
  deleteRole
};
