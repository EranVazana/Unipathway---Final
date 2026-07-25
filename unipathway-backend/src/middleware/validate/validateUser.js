const { failure } = require('./common');
const Settings = require('../../../models/Settings');
const { hashPassword } = require('../../utils/passwordHasher');

const VALID_ROLES = ['admin', 'editor', 'user'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// POST /api/users — full validation including credentials (creates User + UserSettings)
async function validateUser(req, res, next) {
  try {
  const { firstName, lastName, userRole, username, email, password } = req.body;

  if (!firstName || !lastName || !userRole || !username || !email || !password) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: firstName, lastName, userRole, username, email, password.',
      { required: ['firstName', 'lastName', 'userRole', 'username', 'email', 'password'] }
    ));
  }

  const normalizedRole = userRole === 'manager' ? 'editor' : userRole;
  if (!VALID_ROLES.includes(normalizedRole)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `userRole must be one of: ${VALID_ROLES.join(', ')}.`,
      { field: 'userRole', receivedValue: userRole, validValues: VALID_ROLES }
    ));
  }
  req.body.userRole = normalizedRole;

  if (!USERNAME_REGEX.test(username)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'username must be 3-20 characters and contain only letters, numbers, and underscores.',
      { field: 'username', receivedValue: username }
    ));
  }
  const usernameOwner = await Settings.findByUsername(username);
  if (usernameOwner) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'This username is already taken.',
      { field: 'username' }
    ));
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'email must be a valid email address.',
      { field: 'email', receivedValue: email }
    ));
  }
  const emailOwner = await Settings.findByEmail(email);
  if (emailOwner) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'A user with this email already exists.',
      { field: 'email' }
    ));
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'password must be a string of at least 6 characters.',
      { field: 'password' }
    ));
  }

  // Hash now, attach to req so the controller never touches plaintext passwords
  req.hashedCredentials = hashPassword(password);

    next();
  } catch (err) {
    return res.status(500).json(failure('INTERNAL_ERROR', err.message));
  }
}

// PUT /api/users/:id — identity fields only, no credentials here
function validateUserUpdate(req, res, next) {
  const { firstName, lastName, userRole } = req.body;

  if (!firstName || !lastName || !userRole) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'Missing required fields: firstName, lastName, userRole.',
      { required: ['firstName', 'lastName', 'userRole'] }
    ));
  }

  const normalizedRole = userRole === 'manager' ? 'editor' : userRole;
  if (!VALID_ROLES.includes(normalizedRole)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `userRole must be one of: ${VALID_ROLES.join(', ')}.`,
      { field: 'userRole', receivedValue: userRole, validValues: VALID_ROLES }
    ));
  }
  req.body.userRole = normalizedRole;

  next();
}

module.exports = { validateUser, validateUserUpdate };
