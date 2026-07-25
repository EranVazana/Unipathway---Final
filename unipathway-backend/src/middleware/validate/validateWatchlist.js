const { failure } = require('./common');
const User               = require('../../../models/User');
const Department         = require('../../../models/Department');
const AdmissionThreshold = require('../../../models/AdmissionThreshold');
const UserWatchlist      = require('../../../models/UserWatchlist');
const AcademicScores     = require('../../../models/AcademicScores');
const { calculateUserSekem, deriveSekemStatus } = require('../../utils/sekemCalculator');

const VALID_INTENT_STATUSES = ['Interested', 'Applied', 'Accepted', 'Rejected'];

async function validateWatchlist(req, res, next) {
  const { userId, departmentId, status } = req.body;

  if (!userId || !departmentId) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Missing required fields: userId, departmentId.', { required: ['userId', 'departmentId'] }));
  }

  if (status && !VALID_INTENT_STATUSES.includes(status)) {
    return res.status(400).json(failure('VALIDATION_ERROR',
      `status must be one of: ${VALID_INTENT_STATUSES.join(', ')}. sekemStatus is calculated automatically by the server.`,
      { field: 'status', validValues: VALID_INTENT_STATUSES }
    ));
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`, { resource: 'user', id: userId }));
  }

  if (user.userRole !== 'user') {
    return res.status(400).json(failure('VALIDATION_ERROR',
      `Only users with role "user" can have a watchlist. User ${userId} has role "${user.userRole}".`,
      { field: 'userId', userRole: user.userRole }
    ));
  }

  const department = await Department.findById(departmentId);
  if (!department) {
    return res.status(404).json(failure('NOT_FOUND', `Department with id ${departmentId} not found.`, { resource: 'department', id: departmentId }));
  }

  const existing = await UserWatchlist.findAll({ userId, departmentId });
  if (existing.length > 0) {
    return res.status(400).json(failure('VALIDATION_ERROR',
      "This department is already in the user's watchlist.",
      { watchlistId: existing[0].watchlistId }
    ));
  }

  const scores = await AcademicScores.findByUserId(userId);
  const userWithScores = {
    userId,
    psychometricScores: scores?.psychometricScores || null,
    bagrutScores:       scores?.bagrutScores       || null,
  };

  const threshold = await AdmissionThreshold.findLatestByDepartment(departmentId);
  const userSekem = (threshold && userWithScores.psychometricScores && userWithScores.bagrutScores)
    ? calculateUserSekem(userWithScores, threshold)
    : null;

  req.resolvedStatus      = status || 'Interested';
  req.resolvedSekemStatus = deriveSekemStatus(userWithScores, threshold);
  req.calculatedSekem     = userSekem !== null
    ? { userSekem, minSekem: threshold.minSekem, year: threshold.year, meetsThreshold: userSekem >= threshold.minSekem }
    : null;

  next();
}

async function validateWatchlistUpdate(req, res, next) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Missing required field: status.', { required: ['status'] }));
  }

  if (!VALID_INTENT_STATUSES.includes(status)) {
    return res.status(400).json(failure('VALIDATION_ERROR',
      `status must be one of: ${VALID_INTENT_STATUSES.join(', ')}. sekemStatus is calculated automatically by the server.`,
      { field: 'status', validValues: VALID_INTENT_STATUSES }
    ));
  }

  const entry = await UserWatchlist.findById(req.parsedId);
  if (entry) {
    const scores = await AcademicScores.findByUserId(entry.userId);
    const userWithScores = {
      userId: entry.userId,
      psychometricScores: scores?.psychometricScores || null,
      bagrutScores:       scores?.bagrutScores       || null,
    };
    const threshold = await AdmissionThreshold.findLatestByDepartment(entry.departmentId);
    req.resolvedSekemStatus = deriveSekemStatus(userWithScores, threshold);
  }

  next();
}

module.exports = { validateWatchlist, validateWatchlistUpdate };