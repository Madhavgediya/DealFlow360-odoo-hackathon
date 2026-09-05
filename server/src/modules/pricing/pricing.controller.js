const pricingService = require('./pricing.service');

const createPriceList = async (req, res, next) => {
  try {
    const priceList = await pricingService.createPriceList(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: priceList });
  } catch (err) { next(err); }
};

const getPriceLists = async (req, res, next) => {
  try {
    const priceLists = await pricingService.getPriceLists(req.user.company_id);
    res.status(200).json({ success: true, data: priceLists });
  } catch (err) { next(err); }
};

const getPriceListById = async (req, res, next) => {
  try {
    const priceList = await pricingService.getPriceListById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: priceList });
  } catch (err) { next(err); }
};

const updatePriceList = async (req, res, next) => {
  try {
    const priceList = await pricingService.updatePriceList(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: priceList });
  } catch (err) { next(err); }
};

const addPriceListItem = async (req, res, next) => {
  try {
    const item = await pricingService.addPriceListItem(req.params.id, req.body, req.user.company_id);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

const getPriceListItems = async (req, res, next) => {
  try {
    const items = await pricingService.getPriceListItems(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: items });
  } catch (err) { next(err); }
};

module.exports = {
  createPriceList,
  getPriceLists,
  getPriceListById,
  updatePriceList,
  addPriceListItem,
  getPriceListItems
};
