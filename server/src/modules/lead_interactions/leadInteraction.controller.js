const interactionService = require('./leadInteraction.service');

const createInteraction = async (req, res, next) => {
  try {
    const interaction = await interactionService.createInteraction(
      req.params.leadId, req.body, req.user.company_id, req.user.id
    );
    res.status(201).json({ success: true, data: interaction });
  } catch (err) { next(err); }
};

const getInteractions = async (req, res, next) => {
  try {
    const interactions = await interactionService.getInteractions(req.params.leadId, req.user.company_id);
    res.status(200).json({ success: true, data: interactions });
  } catch (err) { next(err); }
};

const getInteractionById = async (req, res, next) => {
  try {
    const interaction = await interactionService.getInteractionById(
      req.params.leadId, req.params.interactionId, req.user.company_id
    );
    res.status(200).json({ success: true, data: interaction });
  } catch (err) { next(err); }
};

const updateInteraction = async (req, res, next) => {
  try {
    const interaction = await interactionService.updateInteraction(
      req.params.leadId, req.params.interactionId, req.body, req.user.company_id
    );
    res.status(200).json({ success: true, data: interaction });
  } catch (err) { next(err); }
};

const deleteInteraction = async (req, res, next) => {
  try {
    await interactionService.deleteInteraction(req.params.leadId, req.params.interactionId, req.user.company_id);
    res.status(200).json({ success: true, message: 'Interaction deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = { createInteraction, getInteractions, getInteractionById, updateInteraction, deleteInteraction };
