const customerRepository = require('./customer.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createCustomer = async (data, companyId) => {
  return customerRepository.createCustomer({ ...data, company_id: companyId });
};

const getCustomers = async (companyId, filters) => {
  return customerRepository.getCustomers(companyId, filters);
};

const getCustomerById = async (id, companyId) => {
  const customer = await customerRepository.getCustomerByIdAndCompany(id, companyId);
  if (!customer) throw createAppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
  return customer;
};

const updateCustomer = async (id, companyId, data) => {
  const customer = await customerRepository.getCustomerByIdAndCompany(id, companyId);
  if (!customer) throw createAppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
  
  return customerRepository.updateCustomer(id, companyId, data);
};

const deleteCustomer = async (id, companyId) => {
  const customer = await customerRepository.getCustomerByIdAndCompany(id, companyId);
  if (!customer) throw createAppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');
  
  await customerRepository.deleteCustomer(id, companyId);
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
