const express = require('express');
const router = express.Router();
const roleController = require('./role.controller');
const roleValidation = require('./role.validation');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/', roleValidation.validateCreateRole, roleController.createRole);
router.get('/', roleController.getRoles);
router.get('/:id', roleValidation.validateUUID, roleController.getRoleById);
router.put('/:id', roleValidation.validateUUID, roleValidation.validateUpdateRole, roleController.updateRole);
router.delete('/:id', roleValidation.validateUUID, roleController.deleteRole);

// Role Permissions
router.get('/:id/permissions', roleValidation.validateUUID, roleController.getRolePermissions);
router.post('/:id/permissions', roleValidation.validateUUID, roleController.updateRolePermissions);

module.exports = router;
