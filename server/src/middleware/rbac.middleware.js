const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Access denied: No role assigned' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: Insufficient privileges' });
    }

    next();
  };
};

const requirePermission = (moduleName, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthenticated' });
    }

    // Super Admin & Company Admin override
    if (req.user.role === 'SUPER_ADMIN' || req.user.role === 'ADMIN') {
      return next();
    }

    const permissions = req.user.permissions || [];
    const requiredPermission = `${moduleName}:${action}`;
    
    // Also support wildcard matching like 'users:*' or '*:*' if we want, but for now exact or module wildcard
    const hasPermission = permissions.includes(requiredPermission) || 
                          permissions.includes(`${moduleName}:*`) || 
                          permissions.includes(`*:*`);

    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied: Missing required permission (${requiredPermission})` 
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
  requirePermission
};
