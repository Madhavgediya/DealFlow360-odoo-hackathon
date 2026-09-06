const quotationRepository = require('./quotation.repository');
const pricingRepository = require('../pricing/pricing.repository');
const customerRepository = require('../customers/customer.repository');
const productRepository = require('../products/product.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createQuotation = async (data, companyId, userId) => {
  // Validate customer
  const customer = await customerRepository.getCustomerByIdAndCompany(data.customer_id, companyId);
  if (!customer) throw createAppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

  return quotationRepository.createQuotation({
    ...data,
    company_id: companyId,
    created_by: userId
  });
};

const getQuotations = async (companyId, filters) => {
  return quotationRepository.getQuotations(companyId, filters);
};

const getQuotationById = async (id, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(id, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');
  
  const lines = await quotationRepository.getQuotationLines(id, companyId);
  quotation.lines = lines;
  
  return quotation;
};

const updateQuotation = async (id, data, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(id, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');

  const updated = await quotationRepository.updateQuotation(id, companyId, data);
  const lines = await quotationRepository.getQuotationLines(id, companyId);
  updated.lines = lines;
  return updated;
};

const updateQuotationStatus = async (id, status, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(id, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');

  return quotationRepository.updateQuotationStatus(id, companyId, status);
};

const deleteQuotation = async (id, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(id, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');

  await quotationRepository.clearQuotationLines(id, companyId);
  return quotationRepository.deleteQuotation(id, companyId);
};

// SERVER-AUTHORITATIVE RECALCULATION
const recalculateQuotationTotals = async (quotationId, companyId) => {
  const lines = await quotationRepository.getQuotationLines(quotationId, companyId);
  
  let subtotal = 0;
  let discount_total = 0;

  for (const line of lines) {
    const lineTotalBeforeDiscount = Number(line.unit_price) * Number(line.quantity);
    const lineDiscount = lineTotalBeforeDiscount * (Number(line.discount_percent) / 100);
    
    subtotal += lineTotalBeforeDiscount;
    discount_total += lineDiscount;
  }

  const taxable = subtotal - discount_total;
  const tax_total = taxable * 0.18; // 18% GST standard
  const total = taxable + tax_total;

  return quotationRepository.updateQuotationTotals(quotationId, companyId, {
    subtotal,
    discount_total,
    tax_total,
    total
  });
};

const addQuotationLine = async (quotationId, data, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(quotationId, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');
  
  if (quotation.status !== 'DRAFT') {
    throw createAppError('Cannot add lines to a non-draft quotation', 422, 'INVALID_STATE');
  }

  const product = await productRepository.getProductByIdAndCompany(data.product_id, companyId);
  if (!product) throw createAppError('Product not found', 404, 'PRODUCT_NOT_FOUND');

  // SERVER-AUTHORITATIVE PRICING
  let unit_price = Number(product.base_price);

  if (data.price_list_id) {
    const listPrice = await pricingRepository.getProductPriceFromList(data.price_list_id, data.product_id, companyId);
    if (listPrice !== undefined) {
      unit_price = Number(listPrice);
    }
  }

  const quantity = Number(data.quantity) || 1;
  const discount_percent = Number(data.discount_percent) || 0;
  
  const lineTotalBeforeDiscount = unit_price * quantity;
  const lineDiscount = lineTotalBeforeDiscount * (discount_percent / 100);
  const line_total = lineTotalBeforeDiscount - lineDiscount;

  const line = await quotationRepository.addQuotationLine({
    company_id: companyId,
    quotation_id: quotationId,
    product_id: data.product_id,
    quantity,
    unit_price,
    discount_percent,
    line_total
  });

  // Re-roll totals
  await recalculateQuotationTotals(quotationId, companyId);

  return line;
};

const replaceQuotationLines = async (quotationId, linesData, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(quotationId, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');

  // Clear existing lines
  await quotationRepository.clearQuotationLines(quotationId, companyId);

  // Add all lines
  for (const item of linesData) {
    let unit_price = Number(item.unit_price) || 0;
    if (!unit_price && item.product_id) {
      const product = await productRepository.getProductByIdAndCompany(item.product_id, companyId);
      if (product) unit_price = Number(product.base_price);
    }

    const quantity = Number(item.quantity) || 1;
    const discount_percent = Number(item.discount_percent || item.discount_percentage) || 0;
    const lineTotalBeforeDiscount = unit_price * quantity;
    const lineDiscount = lineTotalBeforeDiscount * (discount_percent / 100);
    const line_total = lineTotalBeforeDiscount - lineDiscount;

    await quotationRepository.addQuotationLine({
      company_id: companyId,
      quotation_id: quotationId,
      product_id: item.product_id,
      quantity,
      unit_price,
      discount_percent,
      line_total
    });
  }

  // Recalculate
  await recalculateQuotationTotals(quotationId, companyId);
  return getQuotationById(quotationId, companyId, customerId);
};

const removeQuotationLine = async (quotationId, lineId, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(quotationId, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');

  if (quotation.status !== 'DRAFT') {
    throw createAppError('Cannot remove lines from a non-draft quotation', 422, 'INVALID_STATE');
  }

  await quotationRepository.deleteQuotationLine(lineId, quotationId, companyId);
  await recalculateQuotationTotals(quotationId, companyId);
};

const submitQuotation = async (quotationId, companyId, customerId) => {
  const quotation = await quotationRepository.getQuotationByIdAndContext(quotationId, companyId, customerId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');

  if (quotation.status !== 'DRAFT') {
    throw createAppError('Only DRAFT quotations can be submitted', 422, 'INVALID_STATE');
  }

  return quotationRepository.updateQuotationStatus(quotationId, companyId, 'SUBMITTED');
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  updateQuotationStatus,
  deleteQuotation,
  addQuotationLine,
  replaceQuotationLines,
  removeQuotationLine,
  submitQuotation
};
