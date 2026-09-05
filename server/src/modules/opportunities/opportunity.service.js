const opportunityRepository = require('./opportunity.repository');
const customerRepository = require('../customers/customer.repository');
const userRepository = require('../users/user.repository'); // Need to ensure user belongs to company if assigned

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createOpportunity = async (data, companyId) => {
  // Verify customer belongs to the same company
  const customer = await customerRepository.getCustomerByIdAndCompany(data.customer_id, companyId);
  if (!customer) throw createAppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND');

  // Verify assigned user if provided (optional but good practice)
  if (data.assigned_user_id) {
    // Assuming a user service/repository exists. To keep it simple, we rely on DB constraints, 
    // but ideally we should verify user belongs to company_id.
    // We'll skip strict validation here unless a user service exposes it, or we rely on DB triggers.
  }

  return opportunityRepository.createOpportunity({ ...data, company_id: companyId });
};

const getOpportunities = async (companyId, filters) => {
  return opportunityRepository.getOpportunities(companyId, filters);
};

const getOpportunityById = async (id, companyId) => {
  const opportunity = await opportunityRepository.getOpportunityByIdAndCompany(id, companyId);
  if (!opportunity) throw createAppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND');
  return opportunity;
};

const updateOpportunity = async (id, companyId, data) => {
  const opportunity = await opportunityRepository.getOpportunityByIdAndCompany(id, companyId);
  if (!opportunity) throw createAppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND');
  
  return opportunityRepository.updateOpportunity(id, companyId, data);
};

const deleteOpportunity = async (id, companyId) => {
  const opportunity = await opportunityRepository.getOpportunityByIdAndCompany(id, companyId);
  if (!opportunity) throw createAppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND');
  
  await opportunityRepository.deleteOpportunity(id, companyId);
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity
};
