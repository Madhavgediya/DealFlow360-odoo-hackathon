const leadRepository = require('./lead.repository');
const userRepository = require('../users/user.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createLead = async (data, companyId) => {
  // Validate assigned_user_id belongs to same company
  if (data.assigned_user_id) {
    const assignedUser = await userRepository.getUserById(data.assigned_user_id);
    if (!assignedUser) throw createAppError('Assigned user not found', 404, 'ASSIGNED_USER_NOT_FOUND');
    if (assignedUser.company_id !== companyId) throw createAppError('Assigned user belongs to a different company', 403, 'CROSS_COMPANY_ACCESS_DENIED');
  }

  const lead_number = await leadRepository.getNextLeadNumber(companyId);

  return leadRepository.createLead({ ...data, company_id: companyId, lead_number });
};

const getLeads = async (companyId, filters) => {
  return leadRepository.getLeads(companyId, filters);
};

const getLeadById = async (id, companyId) => {
  const lead = await leadRepository.getLeadByIdAndCompany(id, companyId);
  if (!lead) throw createAppError('Lead not found', 404, 'LEAD_NOT_FOUND');
  return lead;
};

const updateLead = async (id, companyId, data) => {
  const lead = await leadRepository.getLeadByIdAndCompany(id, companyId);
  if (!lead) throw createAppError('Lead not found', 404, 'LEAD_NOT_FOUND');

  if (data.assigned_user_id) {
    const assignedUser = await userRepository.getUserById(data.assigned_user_id);
    if (!assignedUser) throw createAppError('Assigned user not found', 404, 'ASSIGNED_USER_NOT_FOUND');
    if (assignedUser.company_id !== companyId) throw createAppError('Assigned user belongs to a different company', 403, 'CROSS_COMPANY_ACCESS_DENIED');
  }

  return leadRepository.updateLead(id, companyId, data);
};

const updateLeadStatus = async (id, companyId, status) => {
  const lead = await leadRepository.getLeadByIdAndCompany(id, companyId);
  if (!lead) throw createAppError('Lead not found', 404, 'LEAD_NOT_FOUND');
  return leadRepository.updateLeadStatus(id, companyId, status);
};

const deleteLead = async (id, companyId) => {
  const lead = await leadRepository.getLeadByIdAndCompany(id, companyId);
  if (!lead) throw createAppError('Lead not found', 404, 'LEAD_NOT_FOUND');
  await leadRepository.deleteLead(id, companyId);
};

module.exports = { createLead, getLeads, getLeadById, updateLead, updateLeadStatus, deleteLead };
