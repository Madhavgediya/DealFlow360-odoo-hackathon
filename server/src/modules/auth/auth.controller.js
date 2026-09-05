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
    const result = await authService.signin(req.body);
    
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

module.exports = {
  signup,
  signin,
  getMe
};
