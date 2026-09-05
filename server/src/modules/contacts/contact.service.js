const contactRepository = require('./contact.repository');
const customerRepository = require('../customers/customer.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createContact = async (data, companyId) => {
  // Verify customer belongs to the same company
  const customer = await customerRepository.getCustomerByIdAndCompany(data.customer_id, companyId);
  if (!customer) throw createAppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

  return contactRepository.createContact({ ...data, company_id: companyId });
};

const getContacts = async (companyId, filters) => {
  return contactRepository.getContacts(companyId, filters);
};

const getContactById = async (id, companyId) => {
  const contact = await contactRepository.getContactByIdAndCompany(id, companyId);
  if (!contact) throw createAppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
  return contact;
};

const updateContact = async (id, companyId, data) => {
  const contact = await contactRepository.getContactByIdAndCompany(id, companyId);
  if (!contact) throw createAppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
  
  return contactRepository.updateContact(id, companyId, data);
};

const deleteContact = async (id, companyId) => {
  const contact = await contactRepository.getContactByIdAndCompany(id, companyId);
  if (!contact) throw createAppError('Contact not found', 404, 'CONTACT_NOT_FOUND');
  
  await contactRepository.deleteContact(id, companyId);
};

module.exports = {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact
};
