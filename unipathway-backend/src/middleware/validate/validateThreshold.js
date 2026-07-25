const { failure, validateSekemFields } = require('./common');

function validateAdmissionThreshold(req, res, next) {
  const { departmentId, year } = req.body;

  if (!departmentId || !year) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: departmentId, year.',
      { required: ['departmentId', 'year'] }
    ));
  }

  if (typeof year !== 'number' || year < 2000 || year > 2100) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'year must be a valid 4-digit number.',
      { field: 'year', receivedValue: year, validRange: '2000-2100' }
    ));
  }

  const sekemError = validateSekemFields(req.body);
  if (sekemError) return res.status(400).json(failure('VALIDATION_ERROR', sekemError));

  next();
}

module.exports = validateAdmissionThreshold;
