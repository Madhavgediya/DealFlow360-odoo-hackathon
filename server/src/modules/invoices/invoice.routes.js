const express = require('express');
const router = express.Router();
const ctrl = require('./invoice.controller');
const { validateGenerate, validateIssue, validateUUID } = require('./invoice.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/generate', requireRole(['ADMIN', 'BILLING_MANAGER']), validateGenerate, ctrl.generateFromOrder);
router.get('/', ctrl.getInvoices);
router.get('/:id', validateUUID('id'), ctrl.getInvoiceById);
router.post('/:id/issue', validateUUID('id'), requireRole(['ADMIN', 'BILLING_MANAGER']), validateIssue, ctrl.issueInvoice);

module.exports = router;
