const AcademicScores     = require('../../models/AcademicScores');
const AdmissionThreshold = require('../../models/AdmissionThreshold');
const UserWatchlist      = require('../../models/UserWatchlist');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

function requester(req) {
  let role = req.headers['x-user-role'];
  if (role === 'manager') role = 'editor';
  const id = parseInt(req.headers['x-user-id']);
  return { role, id: isNaN(id) ? null : id };
}

async function getAllAcademicScores(req, res) {
  try {
    const { role, id } = requester(req);
    const userId = role !== 'admin' ? id : (req.query.userId ? parseInt(req.query.userId) : undefined);
    const result = await AcademicScores.findAll({ userId });
    res.status(200).json(success(result));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getAcademicScoresById(req, res) {
  try {
    const entry = await AcademicScores.findById(req.parsedId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Academic scores entry with id ${req.parsedId} not found.`, { resource: 'academicScores', id: req.parsedId }));
    const { role, id } = requester(req);
    if (role !== 'admin' && entry.userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only view your own academic scores.', { yourId: id }));
    res.status(200).json(success(entry));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function createAcademicScores(req, res) {
  try {
    const { userId, psychometricScores, bagrutScores } = req.body;
    const { role, id } = requester(req);
    if (role !== 'admin' && userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only create academic scores for yourself.', { yourId: id }));
    const academicScoresId = await AcademicScores.create({ userId, psychometricScores, bagrutScores });
    const newEntry = await AcademicScores.findById(academicScoresId);
    const thresholds = await AdmissionThreshold.findAll();
    const updatedCount = await UserWatchlist.recalculateForUser(userId, newEntry, thresholds);
    res.status(201).json(success({ academicScoresId, watchlistEntriesRecalculated: updatedCount }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateAcademicScores(req, res) {
  try {
    const entry = await AcademicScores.findById(req.parsedId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Academic scores entry with id ${req.parsedId} not found.`, { resource: 'academicScores', id: req.parsedId }));
    const { role, id } = requester(req);
    if (role !== 'admin' && entry.userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only update your own academic scores.', { yourId: id }));
    const { psychometricScores, bagrutScores } = req.body;
    await entry.update({ psychometricScores, bagrutScores });
    const thresholds = await AdmissionThreshold.findAll();
    const updatedCount = await UserWatchlist.recalculateForUser(entry.userId, entry, thresholds);
    res.status(200).json(success({ academicScoresId: entry.academicScoresId, watchlistEntriesRecalculated: updatedCount }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function deleteAcademicScores(req, res) {
  try {
    const entry = await AcademicScores.findById(req.parsedId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Academic scores entry with id ${req.parsedId} not found.`, { resource: 'academicScores', id: req.parsedId }));
    const { role, id } = requester(req);
    if (role !== 'admin' && entry.userId !== id) return res.status(403).json(failure('FORBIDDEN', 'You may only delete your own academic scores.', { yourId: id }));
    const userId = entry.userId;
    await entry.delete();
    await UserWatchlist.resetSekemForUser(userId);
    res.status(200).json(success({ academicScoresId: req.parsedId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

module.exports = { getAllAcademicScores, getAcademicScoresById, createAcademicScores, updateAcademicScores, deleteAcademicScores };
