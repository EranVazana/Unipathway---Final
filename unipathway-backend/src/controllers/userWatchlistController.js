const UserWatchlist      = require('../../models/UserWatchlist');
const AdmissionThreshold = require('../../models/AdmissionThreshold');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

function requester(req) {
  let role = req.headers['x-user-role'];
  if (role === 'manager') role = 'editor';
  const id = parseInt(req.headers['x-user-id']);
  return { role, id: isNaN(id) ? null : id };
}

async function getAllWatchlist(req, res) {
  try {
    const { role, id } = requester(req);
    const filters = {
      userId:       role !== 'admin' ? id : (req.query.userId       ? parseInt(req.query.userId)       : undefined),
      departmentId: req.query.departmentId ? parseInt(req.query.departmentId) : undefined,
      status:       req.query.status,
      sekemStatus:  req.query.sekemStatus
    };
    const result = await UserWatchlist.findAll(filters);
    res.status(200).json(success(result));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getWatchlistById(req, res) {
  try {
    const entry = await UserWatchlist.findById(req.parsedId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
    const { role, id } = requester(req);
    if (role !== 'admin' && entry.userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only view your own watchlist entries.', { yourId: id }));
    res.status(200).json(success(entry));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function createWatchlistEntry(req, res) {
  try {
    const { role, id } = requester(req);
    if (role !== 'admin' && req.body.userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only add to your own watchlist.', { yourId: id }));
    const userSekem = req.calculatedSekem ? req.calculatedSekem.userSekem : null;
    const watchlistId = await UserWatchlist.create({
      userId:       req.body.userId,
      departmentId: req.body.departmentId,
      status:       req.resolvedStatus,
      sekemStatus:  req.resolvedSekemStatus,
      userSekem
    });
    res.status(201).json(success({ watchlistId, status: req.resolvedStatus, sekemStatus: req.resolvedSekemStatus, userSekem, sekemInfo: req.calculatedSekem || null }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateWatchlistEntry(req, res) {
  try {
    const entry = await UserWatchlist.findById(req.parsedId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
    const { role, id } = requester(req);
    if (role !== 'admin' && entry.userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only update your own watchlist entries.', { yourId: id }));
    await entry.update({ status: req.body.status, sekemStatus: req.resolvedSekemStatus ?? entry.sekemStatus });
    res.status(200).json(success({ watchlistId: entry.watchlistId, status: entry.status, sekemStatus: entry.sekemStatus, userSekem: entry.userSekem }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function deleteWatchlistEntry(req, res) {
  try {
    const entry = await UserWatchlist.findById(req.parsedId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Watchlist entry with id ${req.parsedId} not found.`, { resource: 'watchlist', id: req.parsedId }));
    const { role, id } = requester(req);
    if (role !== 'admin' && entry.userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only delete your own watchlist entries.', { yourId: id }));
    await entry.delete();
    res.status(200).json(success({ watchlistId: req.parsedId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

module.exports = { getAllWatchlist, getWatchlistById, createWatchlistEntry, updateWatchlistEntry, deleteWatchlistEntry };
