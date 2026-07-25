/**
 * enforceSelfForUsers.js
 *
 * For routes where non-admin roles may only act on their OWN data.
 * Admins bypass the check entirely; everyone else (editor, user) is restricted
 * to records they own.
 *
 * The owner's userId is resolved per-request by an extractor function, since
 * different resources expose it differently:
 *   - academic-scores POST: req.body.userId
 *   - watchlist POST:        req.body.userId
 *   - academic-scores PUT/DELETE: looked up in the DB from the existing record by :id
 *   - watchlist PUT/DELETE:       looked up in the DB from the existing record by :id
 *
 * The extractor may be sync or async; it returns the owning userId (number) or
 * null if it can't be determined (e.g. record not found — in which case we let
 * the controller return its own 404).
 */
function enforceSelfForUsers(getOwnerId) {
  return async (req, res, next) => {
    let role = req.headers['x-user-role'];
    if (role === 'manager') role = 'editor';

    // Admins may act on anyone's data
    if (role === 'admin') return next();

    // All other roles (editor, user) must be acting on their own data
    const requesterId = parseInt(req.headers['x-user-id']);
    if (isNaN(requesterId)) {
      return res.status(401).json({
        success: false,
        data: null,
        error: { code: 'UNAUTHENTICATED', message: 'Missing or invalid x-user-id header. Please log in.', details: {} }
      });
    }

    const ownerId = await getOwnerId(req);
    // If owner can't be determined yet (e.g. record not found), defer to the controller
    if (ownerId === null || ownerId === undefined) return next();

    if (ownerId !== requesterId) {
      return res.status(403).json({
        success: false,
        data: null,
        error: {
          code: 'FORBIDDEN',
          message: 'You may only modify your own data.',
          details: { yourId: requesterId, ownerId }
        }
      });
    }

    next();
  };
}

module.exports = enforceSelfForUsers;
