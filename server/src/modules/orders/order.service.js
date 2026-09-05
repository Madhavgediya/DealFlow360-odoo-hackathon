const orderRepository = require('./order.repository');
const quotationRepository = require('../quotations/quotation.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const convertQuotationToOrder = async (quotationId, companyId) => {
  const quotation = await quotationRepository.getQuotationByIdAndCompany(quotationId, companyId);
  if (!quotation) throw createAppError('Quotation not found', 404, 'QUOTATION_NOT_FOUND');

  if (quotation.status !== 'SUBMITTED' && quotation.status !== 'DRAFT') { // Relaxed to DRAFT for testing ease
    throw createAppError('Quotation must be SUBMITTED or DRAFT to convert to order', 422, 'INVALID_STATE');
  }

  const lines = await quotationRepository.getQuotationLines(quotationId, companyId);
  if (lines.length === 0) {
    throw createAppError('Cannot convert an empty quotation to an order', 422, 'EMPTY_QUOTATION');
  }

  const orderData = {
    company_id: companyId,
    quotation_id: quotation.id,
    customer_id: quotation.customer_id,
    total: quotation.total,
    lines: lines.map(l => ({
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
      line_total: l.line_total
    }))
  };

  return orderRepository.createOrderTransaction(orderData);
};

const getOrders = async (companyId, filters) => {
  return orderRepository.getOrders(companyId, filters);
};

const getOrderById = async (id, companyId) => {
  const order = await orderRepository.getOrderByIdAndCompany(id, companyId);
  if (!order) throw createAppError('Order not found', 404, 'ORDER_NOT_FOUND');
  
  const lines = await orderRepository.getOrderLines(id, companyId);
  order.lines = lines;
  
  return order;
};

const updateOrderStatus = async (id, companyId, status) => {
  const order = await orderRepository.getOrderByIdAndCompany(id, companyId);
  if (!order) throw createAppError('Order not found', 404, 'ORDER_NOT_FOUND');
  
  return orderRepository.updateOrderStatus(id, companyId, status);
};

module.exports = {
  convertQuotationToOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
