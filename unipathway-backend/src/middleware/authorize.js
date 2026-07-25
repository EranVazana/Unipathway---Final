/**
 * Authorization Middleware
 * Usage: authorize('admin', 'editor')
 * Reads role from request header: x-user-role
 *
 * Note: 'manager' is accepted as an alias for 'editor' for backwards compatibility.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    let role = req.headers['x-user-role'];

    // Treat 'manager' as an alias for 'editor'
    if (role === 'manager') role = 'editor';

    if (!role) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'Missing x-user-role header.',
          details: {}
        }
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: { yourRole: req.headers['x-user-role'], requiredRoles: allowedRoles }
        }
      });
    }

    // Attach the resolved role so downstream middleware/controllers know it
    req.userRole = role;
    next();
  };
}

module.exports = authorize;
