const aiService = require('./ai.service');

const queryAI = async (req, res, next) => {
  try {
    const { prompt, contextEntity } = req.body;
    const companyId = req.user?.company_id || req.body.companyId;

    const result = await aiService.queryRAG({
      prompt,
      contextEntity,
      companyId,
      user: req.user,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getChanges = async (req, res, next) => {
  try {
    const companyId = req.user?.company_id;
    const changes = await aiService.getDynamicChanges(companyId);

    res.status(200).json({
      success: true,
      data: changes,
    });
  } catch (err) {
    next(err);
  }
};

const simulate = async (req, res, next) => {
  try {
    const companyId = req.user?.company_id;
    const { type, params } = req.body;

    const simulation = await aiService.simulateWhatIf({
      companyId,
      type,
      params,
    });

    res.status(200).json({
      success: true,
      data: simulation,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  queryAI,
  getChanges,
  simulate,
};
