const userService = require('./user.service');

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user.company_id);
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.user.company_id);
    res.status(200).json({ success: true, data: users });
  } catch (err) { next(err); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id, req.user.company_id);
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.user.company_id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await userService.updateUserStatus(req.params.id, req.user.company_id, req.body.status);
    res.status(200).json({ success: true, data: user });
  } catch (err) { next(err); }
};

module.exports = { createUser, getUsers, getUserById, updateUser, updateUserStatus };
