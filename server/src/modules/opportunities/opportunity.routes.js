const express = require('express');
const router = express.Router();
const ctrl = require('./opportunity.controller');
const { validateCreate, validateUpdate, validateUUID } = require('./opportunity.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateCreate, ctrl.createOpportunity);
router.get('/', ctrl.getOpportunities);
router.get('/:id', validateUUID('id'), ctrl.getOpportunityById);
router.put('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateUpdate, ctrl.updateOpportunity);
router.delete('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER']), ctrl.deleteOpportunity);

module.exports = router;
