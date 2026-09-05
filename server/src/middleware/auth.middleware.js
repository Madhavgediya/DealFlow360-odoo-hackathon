const jwt = require('jsonwebtoken');
const authRepository = require('../modules/auth/auth.repository');

const authenticateFactory = (expectedAudience = 'app') => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check audience
    if (decoded.aud !== expectedAudience) {
      return res.status(403).json({ success: false, message: 'Invalid token audience' });
    }

    const user = await authRepository.findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    // Pass database or other unexpected errors to the global error handler
    next(error);
  }
};

const authenticate = authenticateFactory('app');
const authenticatePortal = authenticateFactory('portal');

module.exports = { authenticate, authenticatePortal, authenticateFactory };
