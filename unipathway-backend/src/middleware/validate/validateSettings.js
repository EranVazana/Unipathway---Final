const { failure } = require('./common');
const Settings = require('../../../models/Settings');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const VALID_THEMES = ['light', 'dark'];

// PUT /api/settings — all fields optional, but validated if present
async function validateSettings(req, res, next) {
  try {
  const { username, email, password, theme } = req.body;
  const currentUserId = parseInt(req.headers['x-user-id']);

  if (username !== undefined) {
    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json(failure(
        'VALIDATION_ERROR',
        'username must be 3-20 characters and contain only letters, numbers, and underscores.',
        { field: 'username', receivedValue: username }
      ));
    }
    const usernameOwner = await Settings.findByUsername(username);
    if (usernameOwner && usernameOwner.userId !== currentUserId) {
      return res.status(400).json(failure(
        'VALIDATION_ERROR',
        'This username is already taken.',
        { field: 'username' }
      ));
    }
  }

  if (email !== undefined) {
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json(failure(
        'VALIDATION_ERROR',
        'email must be a valid email address.',
        { field: 'email', receivedValue: email }
      ));
    }
    const emailOwner = await Settings.findByEmail(email);
    if (emailOwner && emailOwner.userId !== currentUserId) {
      return res.status(400).json(failure(
        'VALIDATION_ERROR',
        'A user with this email already exists.',
        { field: 'email' }
      ));
    }
  }

  if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      'password must be a string of at least 6 characters.',
      { field: 'password' }
    ));
  }

  if (theme !== undefined && !VALID_THEMES.includes(theme)) {
    return res.status(400).json(failure(
      'VALIDATION_ERROR',
      `theme must be one of: ${VALID_THEMES.join(', ')}.`,
      { field: 'theme', receivedValue: theme }
    ));
  }

    next();
  } catch (err) {
    return res.status(500).json(failure('INTERNAL_ERROR', err.message));
  }
}

module.exports = validateSettings;
