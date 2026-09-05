const activityRepository = require('./activity.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createActivity = async (data, companyId, userId) => {
  // Can add validation here to ensure entity exists if needed
  return activityRepository.createActivity({ ...data, company_id: companyId, user_id: userId });
};

const getActivities = async (companyId, filters) => {
  return activityRepository.getActivities(companyId, filters);
};

const getActivityById = async (id, companyId) => {
  const activity = await activityRepository.getActivityByIdAndCompany(id, companyId);
  if (!activity) throw createAppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND');
  return activity;
};

const updateActivity = async (id, companyId, data) => {
  const activity = await activityRepository.getActivityByIdAndCompany(id, companyId);
  if (!activity) throw createAppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND');
  
  return activityRepository.updateActivity(id, companyId, data);
};

const deleteActivity = async (id, companyId) => {
  const activity = await activityRepository.getActivityByIdAndCompany(id, companyId);
  if (!activity) throw createAppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND');
  
  await activityRepository.deleteActivity(id, companyId);
};

module.exports = {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity
};
