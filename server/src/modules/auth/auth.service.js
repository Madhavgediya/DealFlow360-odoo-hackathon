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

module.exports = {
  signup,
  signin
};
