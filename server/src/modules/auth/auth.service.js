const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const { ROLES } = require('./auth.model');

const signup = async (userData) => {
  const { name, email, password, role } = userData;
  
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await authRepository.findUserByEmail(normalizedEmail);
  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Set default role if not provided or valid
  const assignedRole = (role && ROLES[role]) ? role : ROLES.CUSTOMER;

  // Create user
  const newUser = await authRepository.createUser({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role: assignedRole
  });

  return newUser;
};

const signin = async (credentials, audience = 'app') => {
  const { email, password } = credentials;
  
  const normalizedEmail = email.toLowerCase().trim();
  
  // Find user
  const user = await authRepository.findUserByEmail(normalizedEmail);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check status
  if (user.status !== 'ACTIVE') {
    const error = new Error('Account is inactive');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT
  const payload = {
    sub: user.id,
    role: user.role,
    company_id: user.company_id,
    aud: audience
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  // Prepare safe user object to return
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at
  };

  return { token, user: safeUser };
};

const impersonate = async (targetUserId, requestUser, requestTokenPayload) => {
  // 1. Verify that requester is an ADMIN
  if (requestUser.role !== 'ADMIN') {
    const error = new Error('Access denied: Insufficient privileges for impersonation');
    error.statusCode = 403;
    throw error;
  }

  // 2. Prevent nested impersonation
  if (requestTokenPayload.isImpersonation) {
    const error = new Error('Access denied: Cannot perform nested impersonation');
    error.statusCode = 403;
    throw error;
  }

  // 3. Find target user
  const targetUser = await authRepository.findUserById(targetUserId);
  if (!targetUser) {
    const error = new Error('Target user not found');
    error.statusCode = 404;
    throw error;
  }

  // 4. Check status
  if (targetUser.status !== 'ACTIVE') {
    const error = new Error('Target user account is inactive');
    error.statusCode = 401;
    throw error;
  }

  // 5. Tenant Security Check
  if (targetUser.company_id !== requestUser.company_id) {
    const error = new Error('Access denied: Target user belongs to a different organization');
    error.statusCode = 403;
    throw error;
  }

  // 6. Generate Delegated JWT
  const payload = {
    sub: targetUser.id,
    role: targetUser.role,
    company_id: targetUser.company_id,
    aud: 'app',
    isImpersonation: true,
    impersonatedBy: requestUser.id
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h' // Short-lived token for impersonation
  });

  // Prepare safe user object to return
  const safeUser = {
    id: targetUser.id,
    name: targetUser.name,
    email: targetUser.email,
    role: targetUser.role,
    status: targetUser.status,
    created_at: targetUser.created_at,
    updated_at: targetUser.updated_at
  };

  return { token, user: safeUser };
};

module.exports = {
  signup,
  signin,
  impersonate
};
