const customerService = require('./customer.service');

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: customer });
  } catch (err) { next(err); }
};

const getCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getCustomers(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: customers });
  } catch (err) { next(err); }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: customer });
  } catch (err) { next(err); }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: customer });
  } catch (err) { next(err); }
};

const deleteCustomer = async (req, res, next) => {
  try {
    await customerService.deleteCustomer(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
