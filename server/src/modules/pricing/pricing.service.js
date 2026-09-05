const pricingRepository = require('./pricing.repository');
const productRepository = require('../products/product.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createPriceList = async (data, companyId) => {
  return pricingRepository.createPriceList({ ...data, company_id: companyId });
};

const getPriceLists = async (companyId) => {
  return pricingRepository.getPriceLists(companyId);
};

const getPriceListById = async (id, companyId) => {
  const priceList = await pricingRepository.getPriceListByIdAndCompany(id, companyId);
  if (!priceList) throw createAppError('Price list not found', 404, 'PRICE_LIST_NOT_FOUND');
  return priceList;
};

const updatePriceList = async (id, companyId, data) => {
  const priceList = await pricingRepository.getPriceListByIdAndCompany(id, companyId);
  if (!priceList) throw createAppError('Price list not found', 404, 'PRICE_LIST_NOT_FOUND');
  
  return pricingRepository.updatePriceList(id, companyId, data);
};

const addPriceListItem = async (priceListId, data, companyId) => {
  // Ensure price list exists
  const priceList = await pricingRepository.getPriceListByIdAndCompany(priceListId, companyId);
  if (!priceList) throw createAppError('Price list not found', 404, 'PRICE_LIST_NOT_FOUND');

  // Ensure product exists
  const product = await productRepository.getProductByIdAndCompany(data.product_id, companyId);
  if (!product) throw createAppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  return pricingRepository.addPriceListItem({
    company_id: companyId,
    price_list_id: priceListId,
    product_id: data.product_id,
    price: data.price
  });
};

const getPriceListItems = async (priceListId, companyId) => {
  const priceList = await pricingRepository.getPriceListByIdAndCompany(priceListId, companyId);
  if (!priceList) throw createAppError('Price list not found', 404, 'PRICE_LIST_NOT_FOUND');
  
  return pricingRepository.getPriceListItems(priceListId, companyId);
};

module.exports = {
  createPriceList,
  getPriceLists,
  getPriceListById,
  updatePriceList,
  addPriceListItem,
  getPriceListItems
};
