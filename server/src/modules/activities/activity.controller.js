const activityService = require('./activity.service');

const createActivity = async (req, res, next) => {
  try {
    const activity = await activityService.createActivity(req.body, req.user.company_id, req.user.id);
    res.status(201).json({ success: true, data: activity });
  } catch (err) { next(err); }
};

const getActivities = async (req, res, next) => {
  try {
    const activities = await activityService.getActivities(req.user.company_id, req.query);
    res.status(200).json({ success: true, data: activities });
  } catch (err) { next(err); }
};

const getActivityById = async (req, res, next) => {
  try {
    const activity = await activityService.getActivityById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: activity });
  } catch (err) { next(err); }
};

const updateActivity = async (req, res, next) => {
  try {
    const activity = await activityService.updateActivity(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: activity });
  } catch (err) { next(err); }
};

const deleteActivity = async (req, res, next) => {
  try {
    await activityService.deleteActivity(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  } catch (err) { next(err); }
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
};
