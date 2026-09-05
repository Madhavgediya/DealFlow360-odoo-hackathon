const express = require('express');
const router = express.Router();
const ctrl = require('./company.controller');
const { validateCreate, validateUpdate, validateStatus, validateUUID } = require('./company.validation');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/', validateCreate, ctrl.createCompany);
router.get('/', ctrl.getCompanies);
router.get('/:id', validateUUID, ctrl.getCompanyById);
router.put('/:id', validateUUID, validateUpdate, ctrl.updateCompany);
router.patch('/:id/status', validateUUID, validateStatus, ctrl.updateCompanyStatus);

module.exports = router;
