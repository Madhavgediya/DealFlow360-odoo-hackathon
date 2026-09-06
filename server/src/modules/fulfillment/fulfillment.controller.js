const fulfillmentService = require('./fulfillment.service');

const getSplitForQuote = async (req, res, next) => {
  try {
    const plan = await fulfillmentService.getSplitForQuote(req.params.quoteId, req.companyId);
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};

const getSplitForOrder = async (req, res, next) => {
  try {
    const plan = await fulfillmentService.getSplitForOrder(req.params.orderId, req.companyId);
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};

const computeCustomSplit = async (req, res, next) => {
  try {
    const { lines } = req.body;
    const plan = await fulfillmentService.computeWarehouseSplit(lines, req.companyId);
    res.json({ success: true, data: plan });
  } catch (err) { next(err); }
};

module.exports = { getSplitForQuote, getSplitForOrder, computeCustomSplit };
