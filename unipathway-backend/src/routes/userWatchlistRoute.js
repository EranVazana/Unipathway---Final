const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const enforceSelfForUsers = require('../middleware/enforceSelfForUsers');
const { validateId } = require('../middleware/validate/common');
const { validateWatchlist, validateWatchlistUpdate } = require('../middleware/validate/validateWatchlist');
const UserWatchlist = require('../../models/UserWatchlist');
const { getAllWatchlist, getWatchlistById, createWatchlistEntry, updateWatchlistEntry, deleteWatchlistEntry } = require('../controllers/userWatchlistController');

// Resolves the owning userId of a watchlist entry by its :id (or null if not found)
const ownerById = async (req) => {
  const entry = await UserWatchlist.findById(req.parsedId);
  return entry ? entry.userId : null;
};

router.get('/',       authorize('admin', 'user'), getAllWatchlist);
router.get('/:id',    authorize('admin', 'user'), validateId, getWatchlistById);
router.post('/',      authorize('admin', 'user'), enforceSelfForUsers(req => req.body.userId), validateWatchlist, createWatchlistEntry);
router.put('/:id',    authorize('admin', 'user'), validateId, enforceSelfForUsers(ownerById), validateWatchlistUpdate, updateWatchlistEntry);
router.delete('/:id', authorize('admin', 'user'), validateId, enforceSelfForUsers(ownerById), deleteWatchlistEntry);

module.exports = router;