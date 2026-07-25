const { failure } = require('./common');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: email, password.',
      { required: ['email', 'password'] }
    ));
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'email must be a valid email address.',
      { field: 'email', receivedValue: email }
    ));
  }

  next();
}

module.exports = validateLogin;
