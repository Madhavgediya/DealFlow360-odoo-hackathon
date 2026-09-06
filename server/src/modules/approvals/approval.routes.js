const express = require('express');
const router = express.Router();
const ctrl = require('./approval.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

// List approvals (filtered by status)
router.get('/', ctrl.getApprovals);

// Get a single approval by id
router.get('/:id', ctrl.getApprovalById);

// Approve / Reject / Request Changes
router.post('/:id/action',
  requireRole(['SUPERADMIN', 'ADMIN', 'SALES_MANAGER', 'FINANCE', 'FINANCE_DIRECTOR']),
  ctrl.handleApprovalAction
);

// Calculate blended risk score for a set of lines (used live during quote building)
router.post('/calculate-risk', ctrl.calculateRisk);

module.exports = router;
