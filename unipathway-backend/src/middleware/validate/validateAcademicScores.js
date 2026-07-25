const { failure, validatePsychometricScores, validateBagrutScores } = require('./common');
const User          = require('../../../models/User');
const AcademicScores = require('../../../models/AcademicScores');

async function validateAcademicScores(req, res, next) {
  const { userId, psychometricScores, bagrutScores } = req.body;

  if (!userId) {
    return res.status(400).json(failure('VALIDATION_ERROR', 'Missing required field: userId.', { required: ['userId'] }));
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`, { resource: 'user', id: userId }));
  }

  const existing = await AcademicScores.findByUserId(userId);
  if (existing) {
    return res.status(400).json(failure('VALIDATION_ERROR',
      'Academic scores already exist for this user. Use PUT to update them.',
      { existingAcademicScoresId: existing.academicScoresId }
    ));
  }

  const psychError = validatePsychometricScores(psychometricScores);
  if (psychError) return res.status(400).json(failure('VALIDATION_ERROR', psychError));

  const bagrutError = validateBagrutScores(bagrutScores);
  if (bagrutError) return res.status(400).json(failure('VALIDATION_ERROR', bagrutError));

  next();
}

function validateAcademicScoresUpdate(req, res, next) {
  const { psychometricScores, bagrutScores } = req.body;

  const psychError = validatePsychometricScores(psychometricScores);
  if (psychError) return res.status(400).json(failure('VALIDATION_ERROR', psychError));

  const bagrutError = validateBagrutScores(bagrutScores);
  if (bagrutError) return res.status(400).json(failure('VALIDATION_ERROR', bagrutError));

  next();
}

module.exports = { validateAcademicScores, validateAcademicScoresUpdate };