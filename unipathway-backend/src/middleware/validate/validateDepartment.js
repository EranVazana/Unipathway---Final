const { failure } = require('./common');

function validateDepartment(req, res, next) {
  const { universityId, majorName, degreeType, faculty } = req.body;

  if (!universityId || !majorName || !degreeType || !faculty) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: universityId, majorName, degreeType, faculty.',
      { required: ['universityId', 'majorName', 'degreeType', 'faculty'] }
    ));
  }

  next();
}

module.exports = validateDepartment;
