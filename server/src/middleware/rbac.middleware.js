const isSuperAdmin = (role) => {
  if (!role) return false;
  const r = role.toUpperCase().trim();
  return r === 'SUPER_ADMIN' || r === 'SUPERADMIN';
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Access denied: No role assigned' });
    }

    if (isSuperAdmin(req.user.role)) {
      return next();
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const userRole = req.user.role.toUpperCase().trim();
    
    const isAllowed = allowedRoles.some((r) => {
      const targetRole = r.toUpperCase().trim();
      if (targetRole === 'SUPER_ADMIN' || targetRole === 'SUPERADMIN') {
        return isSuperAdmin(userRole);
      }
      return userRole === targetRole;
    });

    if (!isAllowed) {
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
    if (isSuperAdmin(req.user.role) || req.user.role === 'ADMIN') {
      return next();
    }

    const permissions = req.user.permissions || [];
    const requiredPermission = `${moduleName}:${action}`;
    
    // Also support wildcard matching like 'users:*' or '*:*'
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
  requirePermission,
  isSuperAdmin
};

