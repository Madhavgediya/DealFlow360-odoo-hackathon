const interactionRepository = require('./leadInteraction.repository');
const leadRepository = require('../leads/lead.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const verifyLeadAccess = async (leadId, companyId) => {
  const lead = await leadRepository.getLeadByIdAndCompany(leadId, companyId);
  if (!lead) throw createAppError('Lead not found', 404, 'LEAD_NOT_FOUND');
  return lead;
};

const createInteraction = async (leadId, data, companyId, userId) => {
  await verifyLeadAccess(leadId, companyId);
  return interactionRepository.createInteraction({
    ...data,
    lead_id: leadId,
    user_id: userId
  });
};

const getInteractions = async (leadId, companyId) => {
  await verifyLeadAccess(leadId, companyId);
  return interactionRepository.getInteractionsByLead(leadId);
};

const getInteractionById = async (leadId, interactionId, companyId) => {
  await verifyLeadAccess(leadId, companyId);
  const interaction = await interactionRepository.getInteractionById(interactionId, leadId);
  if (!interaction) throw createAppError('Interaction not found', 404, 'LEAD_INTERACTION_NOT_FOUND');
  return interaction;
};

const updateInteraction = async (leadId, interactionId, data, companyId) => {
  await verifyLeadAccess(leadId, companyId);
  const interaction = await interactionRepository.getInteractionById(interactionId, leadId);
  if (!interaction) throw createAppError('Interaction not found', 404, 'LEAD_INTERACTION_NOT_FOUND');
  return interactionRepository.updateInteraction(interactionId, leadId, data);
};

const deleteInteraction = async (leadId, interactionId, companyId) => {
  await verifyLeadAccess(leadId, companyId);
  const interaction = await interactionRepository.getInteractionById(interactionId, leadId);
  if (!interaction) throw createAppError('Interaction not found', 404, 'LEAD_INTERACTION_NOT_FOUND');
  await interactionRepository.deleteInteraction(interactionId, leadId);
};

module.exports = { createInteraction, getInteractions, getInteractionById, updateInteraction, deleteInteraction };
