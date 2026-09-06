const express = require('express');
const router = express.Router();
const ctrl = require('./quotation.controller');
const { validateCreate, validateAddLine, validateUUID } = require('./quotation.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'RETAILER', 'CUSTOMER']), validateCreate, ctrl.createQuotation);
router.get('/', ctrl.getQuotations);
router.get('/:id', validateUUID('id'), ctrl.getQuotationById);
router.patch('/:id', validateUUID('id'), requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'RETAILER', 'CUSTOMER']), ctrl.updateQuotation);
router.patch('/:id/status', validateUUID('id'), requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'RETAILER', 'CUSTOMER']), ctrl.updateQuotationStatus);
router.delete('/:id', validateUUID('id'), requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'RETAILER']), ctrl.deleteQuotation);
router.post('/:id/submit', validateUUID('id'), requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'RETAILER', 'CUSTOMER']), ctrl.submitQuotation);

// Lines
router.put('/:id/lines', validateUUID('id'), requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'RETAILER', 'CUSTOMER']), ctrl.replaceQuotationLines);
router.post('/:id/lines', validateUUID('id'), requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'RETAILER', 'CUSTOMER']), validateAddLine, ctrl.addQuotationLine);
router.delete('/:id/lines/:lineId', validateUUID('id'), validateUUID('lineId'), requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'SALES_REP', 'RETAILER', 'CUSTOMER']), ctrl.removeQuotationLine);

module.exports = router;

