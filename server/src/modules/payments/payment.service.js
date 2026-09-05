const paymentRepository = require('./payment.repository');
const invoiceRepository = require('../invoices/invoice.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const registerPayment = async (data, companyId) => {
  const invoice = await invoiceRepository.getInvoiceByIdAndCompany(data.invoice_id, companyId);
  if (!invoice) throw createAppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');

  try {
    return await paymentRepository.registerPaymentTransaction({
      company_id: companyId,
      invoice_id: invoice.id,
      customer_id: invoice.customer_id,
      amount: data.amount,
      payment_method: data.payment_method,
      reference_number: data.reference_number
    });
  } catch (err) {
    if (err.message.includes('Invoice is already fully paid')) {
      throw createAppError(err.message, 422, 'ALREADY_PAID');
    }
    throw err;
  }
};

const getPayments = async (companyId, filters) => {
  return paymentRepository.getPayments(companyId, filters);
};

const getPaymentById = async (id, companyId) => {
  const payment = await paymentRepository.getPaymentByIdAndCompany(id, companyId);
  if (!payment) throw createAppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  return payment;
};

module.exports = {
  registerPayment,
  getPayments,
  getPaymentById
};
