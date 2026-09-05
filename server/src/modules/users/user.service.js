const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');

const createAppError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const createUser = async (data, companyId) => {
  const email = data.email.toLowerCase().trim();

  const existing = await userRepository.getUserByEmail(email);
  if (existing) throw createAppError('A user with this email already exists', 409, 'USER_ALREADY_EXISTS');

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(data.password, salt);

  return userRepository.createUser({
    ...data,
    email,
    password_hash,
    company_id: companyId
  });
};

const getUsers = async (companyId) => {
  return userRepository.getUsersByCompany(companyId);
};

const getUserById = async (id, companyId) => {
  const user = await userRepository.getUserByIdAndCompany(id, companyId);
  if (!user) throw createAppError('User not found', 404, 'USER_NOT_FOUND');
  return user;
};

const updateUser = async (id, companyId, data) => {
  const user = await userRepository.getUserByIdAndCompany(id, companyId);
  if (!user) throw createAppError('User not found', 404, 'USER_NOT_FOUND');
  return userRepository.updateUser(id, companyId, data);
};

const updateUserStatus = async (id, companyId, status) => {
  const user = await userRepository.getUserByIdAndCompany(id, companyId);
  if (!user) throw createAppError('User not found', 404, 'USER_NOT_FOUND');
  return userRepository.updateUserStatus(id, companyId, status);
};

module.exports = { createUser, getUsers, getUserById, updateUser, updateUserStatus };
