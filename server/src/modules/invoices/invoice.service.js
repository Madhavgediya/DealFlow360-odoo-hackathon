const invoiceRepository = require('./invoice.repository');
const orderRepository = require('../orders/order.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const generateFromOrder = async (orderId, companyId) => {
  const order = await orderRepository.getOrderByIdAndCompany(orderId, companyId);
  if (!order) throw createAppError('Order not found', 404, 'ORDER_NOT_FOUND');

  // Prevent multiple active invoices for simplicity (optional, depending on business rules)
  // We'll allow it but usually it's checked.

  const lines = await orderRepository.getOrderLines(orderId, companyId);
  if (lines.length === 0) {
    throw createAppError('Cannot generate invoice from empty order', 422, 'EMPTY_ORDER');
  }

  const invoiceData = {
    company_id: companyId,
    order_id: order.id,
    customer_id: order.customer_id,
    subtotal: order.total, // For now, assume total is subtotal
    tax_total: 0,
    total: order.total,
    lines: lines.map(l => ({
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
      line_total: l.line_total
    }))
  };

  return invoiceRepository.createInvoiceTransaction(invoiceData);
};

const getInvoices = async (companyId, filters) => {
  return invoiceRepository.getInvoices(companyId, filters);
};

const getInvoiceById = async (id, companyId) => {
  const invoice = await invoiceRepository.getInvoiceByIdAndCompany(id, companyId);
  if (!invoice) throw createAppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
  
  const lines = await invoiceRepository.getInvoiceLines(id, companyId);
  invoice.lines = lines;
  
  return invoice;
};

const issueInvoice = async (id, companyId, dueDate) => {
  const invoice = await invoiceRepository.getInvoiceByIdAndCompany(id, companyId);
  if (!invoice) throw createAppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
  
  if (invoice.status !== 'DRAFT') {
    throw createAppError('Only DRAFT invoices can be issued', 422, 'INVALID_STATE');
  }

  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30); // Net 30 default
  
  return invoiceRepository.updateInvoiceStatus(id, companyId, 'ISSUED', dueDate || defaultDueDate);
};

module.exports = {
  generateFromOrder,
  getInvoices,
  getInvoiceById,
  issueInvoice
};
