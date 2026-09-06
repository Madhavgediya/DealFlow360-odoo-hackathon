const upsellService = require('./upsell.service');

const getSuggestions = async (req, res, next) => {
  try {
    const { productIds, limit } = req.query;
    const existing = productIds ? productIds.split(',').filter(Boolean) : [];
    const data = await upsellService.getUpsellSuggestions(req.companyId, existing, Number(limit) || 5);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getSuggestions };
