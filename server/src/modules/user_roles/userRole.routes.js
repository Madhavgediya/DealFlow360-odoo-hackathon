const express = require('express');
const router = express.Router();
const userRoleController = require('./userRole.controller');
const { validateUUID } = require('../roles/role.validation'); // Reuse UUID validator
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

// API route patterns requested:
// POST   /api/v1/users/:userId/roles/:roleId
// GET    /api/v1/users/:userId/roles
// DELETE /api/v1/users/:userId/roles/:roleId

router.post('/:userId/roles/:roleId', validateUUID, userRoleController.assignRole);
router.get('/:userId/roles', validateUUID, userRoleController.getUserRoles);
router.delete('/:userId/roles/:roleId', validateUUID, userRoleController.removeRole);

module.exports = router;
