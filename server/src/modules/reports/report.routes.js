const express = require('express');
const router = express.Router();
const ctrl = require('./report.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.get('/dashboard', requireRole(['ADMIN', 'SALES_MANAGER']), ctrl.getDashboardMetrics);

module.exports = router;
