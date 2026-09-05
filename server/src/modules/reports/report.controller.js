const reportService = require('./report.service');

const getDashboardMetrics = async (req, res, next) => {
  try {
    const metrics = await reportService.getDashboardMetrics(req.user.company_id);
    res.status(200).json({ success: true, data: metrics });
  } catch (err) { next(err); }
};

module.exports = {
  getDashboardMetrics
};
