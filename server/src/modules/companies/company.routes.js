const express = require('express');
const router = express.Router();
const ctrl = require('./company.controller');
const { validateCreate, validateUpdate, validateStatus, validateUUID } = require('./company.validation');
const { authenticate } = require('../../middleware/auth.middleware');

const { requireRole } = require('../../middleware/rbac.middleware');

router.use(authenticate);

router.post('/', requireRole(['SUPER_ADMIN']), validateCreate, ctrl.createCompany);
router.get('/', requireRole(['SUPER_ADMIN']), ctrl.getCompanies);
router.get('/:id', validateUUID, requireRole(['SUPER_ADMIN']), ctrl.getCompanyById);
router.put('/:id', validateUUID, validateUpdate, requireRole(['SUPER_ADMIN', 'ADMIN']), ctrl.updateCompany);
router.patch('/:id/status', validateUUID, validateStatus, requireRole(['SUPER_ADMIN']), ctrl.updateCompanyStatus);

module.exports = router;
