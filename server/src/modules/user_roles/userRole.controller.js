const userRoleService = require('./userRole.service');

const assignRole = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    const userRole = await userRoleService.assignRole(userId, roleId, req.user.company_id);
    res.status(201).json({
      success: true,
      data: userRole
    });
  } catch (error) {
    next(error);
  }
};

const getUserRoles = async (req, res, next) => {
  try {
    const roles = await userRoleService.getUserRoles(req.params.userId, req.user.company_id);
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

const removeRole = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    await userRoleService.removeRole(userId, roleId, req.user.company_id);
    res.status(200).json({
      success: true,
      message: 'Role removed from user successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  assignRole,
  getUserRoles,
  removeRole
};
