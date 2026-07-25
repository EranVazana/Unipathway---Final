const { failure } = require('./common');

function validateUniversity(req, res, next) {
  const { name, location } = req.body;

  if (!name || !location) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: name, location.',
      { required: ['name', 'location'] }
    ));
  }

  next();
}

module.exports = validateUniversity;
