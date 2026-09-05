const express = require('express');
const router = express.Router();
const ctrl = require('./ai.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.post('/query', ctrl.queryAI);
router.get('/changes', ctrl.getChanges);
router.post('/simulate', ctrl.simulate);

module.exports = router;
