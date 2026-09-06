const express = require('express');
const router = express.Router();
const ctrl = require('./fulfillment.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');

router.use(authenticate);
router.use(apiLimiter);

router.get('/quote/:quoteId', ctrl.getSplitForQuote);
router.get('/order/:orderId', ctrl.getSplitForOrder);
router.post('/compute', ctrl.computeCustomSplit);

module.exports = router;
