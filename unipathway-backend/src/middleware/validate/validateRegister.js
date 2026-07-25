// middleware/validate/validateRegister.js
// Public self-registration — always creates a 'user' role account.

const { failure } = require('./common');
const Settings = require('../../../models/Settings');
const { hashPassword } = require('../../utils/passwordHasher');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

async function validateRegister(req, res, next) {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    // Required fields
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json(failure(
        'VALIDATION_ERROR',
        'Missing required fields: firstName, lastName, username, email, password.',
        { required: ['firstName', 'lastName', 'username', 'email', 'password'] }
      ));
    }

    // Name length sanity
    if (firstName.trim().length < 2) {
      return res.status(400).json(failure('VALIDATION_ERROR', 'firstName must be at least 2 characters.', { field: 'firstName' }));
    }
    if (lastName.trim().length < 2) {
      return res.status(400).json(failure('VALIDATION_ERROR', 'lastName must be at least 2 characters.', { field: 'lastName' }));
    }

    // Username format + uniqueness (checked against the DB)
    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json(failure(
        'VALIDATION_ERROR',
        'username must be 3-20 characters and contain only letters, numbers, and underscores.',
        { field: 'username', receivedValue: username }
      ));
    }
    const usernameOwner = await Settings.findByUsername(username);
    if (usernameOwner) {
      return res.status(400).json(failure('VALIDATION_ERROR', 'This username is already taken.', { field: 'username' }));
    }

    // Email format + uniqueness (checked against the DB)
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json(failure('VALIDATION_ERROR', 'email must be a valid email address.', { field: 'email', receivedValue: email }));
    }
    const emailOwner = await Settings.findByEmail(email);
    if (emailOwner) {
      return res.status(400).json(failure('VALIDATION_ERROR', 'A user with this email already exists.', { field: 'email' }));
    }

    // Password length
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json(failure('VALIDATION_ERROR', 'password must be a string of at least 6 characters.', { field: 'password' }));
    }

    // Hardcode role — public registration is always 'user'
    req.body.userRole = 'user';

    // Hash now so the controller never touches plaintext
    req.hashedCredentials = hashPassword(password);

    next();
  } catch (err) {
    res.status(500).json(failure('INTERNAL_ERROR', err.message));
  }
}

module.exports = validateRegister;
