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
  const password_hash = await bcrypt.hash(data.password || 'DealFlow@2026', salt);

  const targetCompanyId = data.company_id || data.companyId || companyId;
  const targetRole = data.role || 'CUSTOMER';

  const user = await userRepository.createUser({
    ...data,
    email,
    password_hash,
    company_id: targetCompanyId,
    role: targetRole
  });

  const db = require('../../config/database');
  const roleId = data.role_id || data.roleId;
  if (roleId) {
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING',
      [user.id, roleId]
    );
  } else if (targetRole && targetCompanyId) {
    const roleLookup = await db.query(
      'SELECT id FROM roles WHERE company_id = $1 AND code = $2',
      [targetCompanyId, targetRole]
    );
    if (roleLookup.rows.length > 0) {
      await db.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING',
        [user.id, roleLookup.rows[0].id]
      );
    }
  }

  return userRepository.getUserByIdAndCompany(user.id, targetCompanyId);
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
  
  await userRepository.updateUser(id, companyId, data);
  const roleId = data.role_id || data.roleId;
  const db = require('../../config/database');
  if (roleId) {
    await db.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
    await db.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING',
      [id, roleId]
    );
  }

  return userRepository.getUserByIdAndCompany(id, companyId);
};

const updateUserStatus = async (id, companyId, status) => {
  const user = await userRepository.getUserByIdAndCompany(id, companyId);
  if (!user) throw createAppError('User not found', 404, 'USER_NOT_FOUND');
  return userRepository.updateUserStatus(id, companyId, status);
};

module.exports = { createUser, getUsers, getUserById, updateUser, updateUserStatus };

