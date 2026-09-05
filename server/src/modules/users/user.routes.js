const express = require('express');
const router = express.Router();
const ctrl = require('./user.controller');
const { validateCreate, validateUpdate, validateStatus, validateUUID } = require('./user.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const userRoleCtrl = require('../user_roles/userRole.controller');
const { validateUUID: validateRoleUUID } = require('../roles/role.validation');

router.use(authenticate);

// User CRUD
router.post('/', validateCreate, ctrl.createUser);
router.get('/', ctrl.getUsers);
router.get('/:id', validateUUID, ctrl.getUserById);
router.put('/:id', validateUUID, validateUpdate, ctrl.updateUser);
router.patch('/:id/status', validateUUID, validateStatus, ctrl.updateUserStatus);

// User Role assignments (nested under /users)
router.post('/:userId/roles/:roleId', validateRoleUUID, userRoleCtrl.assignRole);
router.get('/:userId/roles', validateRoleUUID, userRoleCtrl.getUserRoles);
router.delete('/:userId/roles/:roleId', validateRoleUUID, userRoleCtrl.removeRole);

module.exports = router;
