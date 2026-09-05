const express = require('express');
const router = express.Router();
const ctrl = require('./activity.controller');
const { validateCreate, validateUpdate, validateUUID } = require('./activity.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/rbac.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/', requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateCreate, ctrl.createActivity);
router.get('/', ctrl.getActivities);
router.get('/:id', validateUUID('id'), ctrl.getActivityById);
router.put('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), validateUpdate, ctrl.updateActivity);
router.delete('/:id', validateUUID('id'), requireRole(['ADMIN', 'SALES_MANAGER', 'SALES_REP']), ctrl.deleteActivity);

module.exports = router;
