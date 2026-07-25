/**
 * Allows access if the requester is either:
 *   - one of the allowed roles (admin), or
 *   - the user whose ID matches the :id route param (self-update)
 *
 * Self-identification uses the x-user-id header (simulated auth for Assignment 2).
 *
 * Usage in routes:
 *   router.put('/:id', validateId, authorizeSelfOrRoles('admin'), validateUser, updateUser);
 */
function authorizeSelfOrRoles(...allowedRoles) {
  return (req, res, next) => {
    let role = req.headers['x-user-role'];
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

    // Admin / editor (depending on caller) always allowed
    if (allowedRoles.includes(role)) {
      req.userRole = role;
      return next();
    }

    // Self-update path: user can act on their own record
    const requesterId = parseInt(req.headers['x-user-id']);
    if (role === 'user' && !isNaN(requesterId) && requesterId === req.parsedId) {
      req.userRole = role;
      req.isSelf = true;
      return next();
    }

    return res.status(403).json({
      success: false,
      data: null,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
        details: {
          yourRole: req.headers['x-user-role'],
          requiredRoles: allowedRoles,
          note: 'Users may only update their own record (send x-user-id matching the :id).'
        }
      }
    });
  };
}

module.exports = authorizeSelfOrRoles;