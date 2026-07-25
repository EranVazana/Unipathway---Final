/**
 * authorizeSelfRead.js
 *
 * For READ routes where any authenticated user may access their OWN record,
 * and the listed roles may access anyone's.
 *
 * Difference from authorizeSelfOrRoles: the self-match here applies to ANY role
 * (admin/editor/user), since viewing one's own record is always allowed. The
 * stricter authorizeSelfOrRoles limits self-access to the 'user' role and is used
 * for write routes where editors must stay blocked.
 *
 * Usage:
 *   router.get('/:id', validateId, authorizeSelfRead('admin'), getUserById);
 */
function authorizeSelfRead(...allowedRoles) {
  return (req, res, next) => {
    let role = req.headers['x-user-role'];
    if (role === 'manager') role = 'editor';

    if (!role) {
      return res.status(403).json({
        success: false,
        data: null,
        error: { code: 'FORBIDDEN', message: 'Missing x-user-role header.', details: {} }
      });
    }

    // Roles with blanket access (e.g. admin)
    if (allowedRoles.includes(role)) {
      req.userRole = role;
      return next();
    }

    // Any authenticated role may read their OWN record
    const requesterId = parseInt(req.headers['x-user-id']);
    if (!isNaN(requesterId) && requesterId === req.parsedId) {
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
          note: 'You may only view your own record (send x-user-id matching the :id).'
        }
      }
    });
  };
}

module.exports = authorizeSelfRead;