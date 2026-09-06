const approvalService = require('./approval.service');

const getApprovals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const data = await approvalService.getApprovals(req.companyId, { status });
    res.json({ success: true, data, total: data.length });
  } catch (err) { next(err); }
};

const getApprovalById = async (req, res, next) => {
  try {
    const data = await approvalService.getApprovalById(req.params.id, req.companyId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const handleApprovalAction = async (req, res, next) => {
  try {
    const { action, comments, reason } = req.body;
    const data = await approvalService.handleApprovalAction(
      req.params.id,
      req.companyId,
      action,
      req.userId,
      req.user?.name || 'Manager',
      req.user?.role || 'SALES_MANAGER',
      comments,
      reason
    );
    res.json({ success: true, data, message: data.message });
  } catch (err) { next(err); }
};

const calculateRisk = async (req, res, next) => {
  try {
    const { lines, customerTier } = req.body;
    const risk = approvalService.calculateBlendedRiskScore(lines, { customerTier });
    res.json({ success: true, data: risk });
  } catch (err) { next(err); }
};

module.exports = { getApprovals, getApprovalById, handleApprovalAction, calculateRisk };
