const quotationService = require('./quotation.service');

const createQuotation = async (req, res, next) => {
  try {
    const quotation = await quotationService.createQuotation(req.body, req.user.company_id, req.user.id);
    res.status(201).json({ success: true, data: quotation });
  } catch (err) { next(err); }
};

const getQuotations = async (req, res, next) => {
  try {
    const filters = req.query;
    if (req.user.role === 'CUSTOMER') {
      filters.customer_id = req.user.customer_id;
    }
    const quotations = await quotationService.getQuotations(req.user.company_id, filters);
    res.status(200).json({ success: true, data: quotations });
  } catch (err) { next(err); }
};

const getQuotationById = async (req, res, next) => {
  try {
    const quotation = await quotationService.getQuotationById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: quotation });
  } catch (err) { next(err); }
};

const addQuotationLine = async (req, res, next) => {
  try {
    const line = await quotationService.addQuotationLine(req.params.id, req.body, req.user.company_id);
    res.status(201).json({ success: true, data: line });
  } catch (err) { next(err); }
};

const removeQuotationLine = async (req, res, next) => {
  try {
    await quotationService.removeQuotationLine(req.params.id, req.params.lineId, req.user.company_id);
    res.status(200).json({ success: true, message: 'Line removed successfully' });
  } catch (err) { next(err); }
};

const submitQuotation = async (req, res, next) => {
  try {
    const quotation = await quotationService.submitQuotation(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: quotation });
  } catch (err) { next(err); }
};

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  addQuotationLine,
  removeQuotationLine,
  submitQuotation
};
