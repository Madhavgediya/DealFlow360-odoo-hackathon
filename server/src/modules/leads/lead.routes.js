const express = require('express');
const router = express.Router();
const ctrl = require('./lead.controller');
const { validateCreate, validateUpdate, validateStatus, validateFilters, validateUUID } = require('./lead.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');
const interactionRoutes = require('../lead_interactions/leadInteraction.routes');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateCreate, ctrl.createLead);
router.get('/', validateFilters, ctrl.getLeads);
router.get('/:id', validateUUID('id'), ctrl.getLeadById);
router.put('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateUpdate, ctrl.updateLead);
router.patch('/:id/status', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateStatus, ctrl.updateLeadStatus);
router.delete('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER']), ctrl.deleteLead);

// Nested interactions
router.use('/:leadId/interactions', validateUUID('leadId'), interactionRoutes);

module.exports = router;
