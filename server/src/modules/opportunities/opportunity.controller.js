const opportunityService = require('./opportunity.service');

const createOpportunity = async (req, res, next) => {
  try {
    const opportunity = await opportunityService.createOpportunity(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: opportunity });
  } catch (err) { next(err); }
};

const getOpportunities = async (req, res, next) => {
  try {
    const opportunities = await opportunityService.getOpportunities(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: opportunities });
  } catch (err) { next(err); }
};

const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await opportunityService.getOpportunityById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: opportunity });
  } catch (err) { next(err); }
};

const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await opportunityService.updateOpportunity(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: opportunity });
  } catch (err) { next(err); }
};

const deleteOpportunity = async (req, res, next) => {
  try {
    await opportunityService.deleteOpportunity(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  createOpportunity,
  getOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity
};
