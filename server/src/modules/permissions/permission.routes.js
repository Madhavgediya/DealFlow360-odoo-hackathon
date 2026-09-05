const express = require('express');
const router = express.Router();
const permissionController = require('./permission.controller');
const permissionValidation = require('./permission.validation');
const { validateUUID } = require('../roles/role.validation'); // Reuse UUID validator
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/', permissionValidation.validateCreatePermission, permissionController.createPermission);
router.get('/', permissionController.getPermissions);
router.get('/:id', validateUUID, permissionController.getPermissionById);
router.put('/:id', validateUUID, permissionValidation.validateUpdatePermission, permissionController.updatePermission);
router.delete('/:id', validateUUID, permissionController.deletePermission);

module.exports = router;
