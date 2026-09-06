const jwt = require('jsonwebtoken');
const authRepository = require('../modules/auth/auth.repository');

const authenticateFactory = (expectedAudience = 'app') => async (req, res, next) => {
  try {
    let token = req.cookies?.dealflow360_jwt;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      console.log('[Auth Middleware] Token missing');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check audience
    if (decoded.aud !== expectedAudience) {
      console.log('[Auth Middleware] Invalid audience');
      return res.status(403).json({ success: false, message: 'Invalid token audience' });
    }

    const user = await authRepository.findUserById(decoded.sub);

    if (!user) {
      console.log('[Auth Middleware] User not found for ID:', decoded.sub);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      console.log('[Auth Middleware] User not active:', user.status);
      return res.status(401).json({ success: false, message: 'Account is inactive' });
    }

    // Fetch dynamic permissions based on assigned roles
    try {
      const rolePermissionRepo = require('../modules/roles/rolePermission.repository');
      const dbPermissions = await rolePermissionRepo.getUserPermissions(user.id);
      user.permissions = dbPermissions.map(p => `${p.module}:${p.action}`);
    } catch (err) {
      user.permissions = [];
    }

    // Super Admin tenant context hydration
    if (user.role === 'SUPER_ADMIN') {
      const tenantId = req.headers['x-company-id'];
      // Only hydrate if it's a valid UUID to prevent Postgres 22P02 (Invalid text representation) errors
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (tenantId && uuidRegex.test(tenantId)) {
        user.company_id = tenantId;
      }
    }

    // Hydrate customer_id if user is a CUSTOMER or RETAILER
    if (user.role === 'CUSTOMER' || user.role === 'RETAILER') {
      try {
        const db = require('../config/database');
        const contactRes = await db.query(
          'SELECT customer_id FROM contacts WHERE email = $1 AND company_id = $2 LIMIT 1',
          [user.email, user.company_id]
        );
        if (contactRes.rows.length > 0) {
          user.customer_id = contactRes.rows[0].customer_id;
        } else {
          // Auto-create customer profile for this user
          const custRes = await db.query(
            'INSERT INTO customers (company_id, name, status) VALUES ($1, $2, $3) RETURNING id',
            [user.company_id, user.name || user.email, 'ACTIVE']
          );
          const newCustomerId = custRes.rows[0].id;
          
          await db.query(
            'INSERT INTO contacts (company_id, customer_id, first_name, last_name, email, is_primary) VALUES ($1, $2, $3, $4, $5, $6)',
            [user.company_id, newCustomerId, user.name || 'User', '', user.email, true]
          );
          
          user.customer_id = newCustomerId;
        }
      } catch (err) {
        console.error('Error hydrating customer_id:', err);
      }
    }

    req.user = user;
    req.tokenPayload = decoded;
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
