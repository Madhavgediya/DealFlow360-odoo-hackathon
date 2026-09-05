const authService = require('./auth.service');

const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    
    // Do not return password_hash
    const { password_hash, ...safeUser } = user;
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const audience = req.body.audience || 'app';
    const result = await authService.signin(req.body, audience);
    
    res.cookie('dealflow360_jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is set by auth.middleware.js
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  res.clearCookie('dealflow360_jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const impersonate = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    
    // Call the service with target user ID, requester user object, and requester token payload
    const result = await authService.impersonate(targetUserId, req.user, req.tokenPayload);
    
    // Send back the delegated token in a secure cookie exactly like signin
    res.cookie('dealflow360_jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000 // 1 hour for impersonation token
    });

    res.status(200).json({
      success: true,
      message: 'Impersonation session started successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  getMe,
  logout,
  impersonate
};
