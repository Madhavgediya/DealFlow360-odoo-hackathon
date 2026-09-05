const express = require('express');
const router = express.Router();
const ctrl = require('./quotation.controller');
const { validateCreate, validateAddLine, validateUUID } = require('./quotation.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateCreate, ctrl.createQuotation);
router.get('/', ctrl.getQuotations);
router.get('/:id', validateUUID('id'), ctrl.getQuotationById);
router.post('/:id/submit', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), ctrl.submitQuotation);

// Lines
router.post('/:id/lines', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateAddLine, ctrl.addQuotationLine);
router.delete('/:id/lines/:lineId', validateUUID('id'), validateUUID('lineId'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), ctrl.removeQuotationLine);

module.exports = router;
