/**
 * common.js
 * Shared validation utilities used across multiple validators.
 * Import from here to avoid duplication.
 */

const MANDATORY_SUBJECTS = [
  'bibleStudies', 'literature', 'hebrewExpression',
  'history', 'civics', 'mathematics', 'english'
];

const MANDATORY_MIN_UNITS = {
  bibleStudies: 2, literature: 2, hebrewExpression: 2,
  history: 2, civics: 2, mathematics: 3, english: 3
};

const VALID_SEKEM_TYPES = ['quantitative', 'verbal', 'general'];

// Builds a consistent error response object
function failure(code, message, details = {}) {
  return { success: false, data: null, error: { code, message, details } };
}

// Validates /:id param, parses it, attaches req.parsedId
function validateId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Invalid ID: must be a positive integer.',
      { param: 'id', receivedValue: req.params.id }
    ));
  }
  req.parsedId = id;
  next();
}

// Returns error string or null — used by validateUser
function validatePsychometricScores(scores) {
  if (!scores) return null;
  const { verbal, quantitative, english } = scores;
  if (
    typeof verbal !== 'number'       || verbal < 50       || verbal > 150 ||
    typeof quantitative !== 'number' || quantitative < 50 || quantitative > 150 ||
    typeof english !== 'number'      || english < 50      || english > 150
  ) {
    return 'psychometricScores fields (verbal, quantitative, english) must be numbers between 50 and 150.';
  }
  return null;
}

// Returns error string or null — used by validateUser
function validateBagrutScores(scores) {
  if (!scores) return null;
  for (const subject of MANDATORY_SUBJECTS) {
    if (!scores[subject]) return `Missing mandatory bagrut subject: ${subject}.`;
    const { grade, units } = scores[subject];
    if (typeof grade !== 'number' || grade < 0 || grade > 100)
      return `${subject}: grade must be a number between 0 and 100.`;
    if (typeof units !== 'number' || units < MANDATORY_MIN_UNITS[subject])
      return `${subject}: units must be at least ${MANDATORY_MIN_UNITS[subject]}.`;
  }
  for (const [subject, value] of Object.entries(scores)) {
    if (MANDATORY_SUBJECTS.includes(subject)) continue;
    const { grade, units } = value;
    if (typeof grade !== 'number' || grade < 0 || grade > 100)
      return `${subject}: grade must be a number between 0 and 100.`;
    if (typeof units !== 'number' || units < 1 || units > 5)
      return `${subject}: units must be between 1 and 5.`;
  }
  return null;
}

// Returns error string or null — used by validateThreshold
function validateSekemFields(body) {
  const { sekemType, sekemWeights, minSekem } = body;
  if (!sekemType || !sekemWeights || minSekem === undefined)
    return 'Missing required fields: sekemType, sekemWeights, minSekem.';
  if (!VALID_SEKEM_TYPES.includes(sekemType))
    return `sekemType must be one of: ${VALID_SEKEM_TYPES.join(', ')}.`;
  const { bagrutWeight, psychometricWeight } = sekemWeights;
  if (
    typeof bagrutWeight !== 'number' || typeof psychometricWeight !== 'number' ||
    Math.abs(bagrutWeight + psychometricWeight - 1) > 0.001
  ) return 'sekemWeights.bagrutWeight and sekemWeights.psychometricWeight must be numbers that sum to 1.';
  if (typeof minSekem !== 'number' || minSekem < 0)
    return 'minSekem must be a positive number.';
  return null;
}

module.exports = {
  failure,
  validateId,
  validatePsychometricScores,
  validateBagrutScores,
  validateSekemFields,
  MANDATORY_SUBJECTS,
  MANDATORY_MIN_UNITS,
  VALID_SEKEM_TYPES
};
