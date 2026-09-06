const express = require('express');
const router = express.Router();
const ctrl = require('./upsell.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

// GET /api/v1/upsell/suggestions?productIds=id1,id2&limit=5
router.get('/suggestions', ctrl.getSuggestions);

module.exports = router;
