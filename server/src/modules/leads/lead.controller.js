const leadService = require('./lead.service');

const createLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const getLeads = async (req, res, next) => {
  try {
    const leads = await leadService.getLeads(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: leads });
  } catch (err) { next(err); }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const lead = await leadService.updateLeadStatus(req.params.id, req.user.company_id, req.body.status);
    res.status(200).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

const deleteLead = async (req, res, next) => {
  try {
    await leadService.deleteLead(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { createLead, getLeads, getLeadById, updateLead, updateLeadStatus, deleteLead };
