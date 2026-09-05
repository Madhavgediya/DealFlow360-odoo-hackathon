const paymentService = require('./payment.service');

const registerPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.registerPayment(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: payment });
  } catch (err) { next(err); }
};

const getPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPayments(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: payments });
  } catch (err) { next(err); }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: payment });
  } catch (err) { next(err); }
};

module.exports = {
  registerPayment,
  getPayments,
  getPaymentById
};
