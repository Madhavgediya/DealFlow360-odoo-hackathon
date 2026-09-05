const invoiceService = require('./invoice.service');

const generateFromOrder = async (req, res, next) => {
  try {
    const invoice = await invoiceService.generateFromOrder(req.body.order_id, req.user.company_id);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await invoiceService.getInvoices(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: invoices });
  } catch (err) { next(err); }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

const issueInvoice = async (req, res, next) => {
  try {
    const invoice = await invoiceService.issueInvoice(req.params.id, req.user.company_id, req.body.due_date);
    res.status(200).json({ success: true, data: invoice });
  } catch (err) { next(err); }
};

module.exports = {
  generateFromOrder,
  getInvoices,
  getInvoiceById,
  issueInvoice
};
