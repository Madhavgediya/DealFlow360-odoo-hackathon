const express = require('express');
const router = express.Router();
const ctrl = require('./contact.controller');
const { validateCreate, validateUpdate, validateUUID } = require('./contact.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateCreate, ctrl.createContact);
router.get('/', ctrl.getContacts);
router.get('/:id', validateUUID('id'), ctrl.getContactById);
router.put('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateUpdate, ctrl.updateContact);
router.delete('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER']), ctrl.deleteContact);

module.exports = router;
