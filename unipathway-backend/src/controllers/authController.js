const Settings       = require('../../models/Settings');
const User           = require('../../models/User');
const AcademicScores = require('../../models/AcademicScores');
const { verifyPassword } = require('../utils/passwordHasher');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

// Default Bagrut template — all 7 mandatory subjects with minimum units and 0 grade.
// The user fills in their real scores from the Academic Scores page.
const DEFAULT_BAGRUT = {
  bibleStudies:     { grade: 0, units: 2 },
  literature:       { grade: 0, units: 2 },
  hebrewExpression: { grade: 0, units: 2 },
  history:          { grade: 0, units: 2 },
  civics:           { grade: 0, units: 2 },
  mathematics:      { grade: 0, units: 3 },
  english:          { grade: 0, units: 3 }
};

const DEFAULT_PSYCHOMETRIC = { verbal: 50, quantitative: 50, english: 50 };

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const userSettings = await Settings.findByEmail(email);
    if (!userSettings || !verifyPassword(password, userSettings.passwordSalt, userSettings.passwordHash)) {
      return res.status(401).json(failure('INVALID_CREDENTIALS', 'Invalid email or password.', {}));
    }
    const user = await User.findByIdWithSettings(userSettings.userId);
    res.status(200).json(success({ message: 'Login successful.', user }));
  } catch (err) {
    res.status(500).json(failure('INTERNAL_ERROR', err.message));
  }
}

// POST /api/auth/register — public, always creates a 'user' role account
async function register(req, res) {
  try {
    const { firstName, lastName, username, email, userRole } = req.body;

    // 1. Identity row
    const userId = await User.create({
      firstName: firstName.trim(),
      lastName:  lastName.trim(),
      userRole   // always 'user', enforced by validateRegister
    });

    // 2. Credentials + settings (req.hashedCredentials attached by validateRegister)
    await Settings.create({
      userId,
      username:     username.trim(),
      email:        email.toLowerCase().trim(),
      passwordHash: req.hashedCredentials.hash,
      passwordSalt: req.hashedCredentials.salt,
      theme:        'light'
    });

    // 3. Seed a default academic scores record so the user's profile is complete
    //    and the Academic Scores page loads immediately after signup.
    await AcademicScores.create({
      userId,
      psychometricScores: { ...DEFAULT_PSYCHOMETRIC },
      bagrutScores: JSON.parse(JSON.stringify(DEFAULT_BAGRUT))
    });

    const user = await User.findByIdWithSettings(userId);
    res.status(201).json(success({ message: 'Registration successful.', user }));
  } catch (err) {
    res.status(500).json(failure('INTERNAL_ERROR', err.message));
  }
}

// POST /api/auth/logout — stateless on the server
async function logout(req, res) {
  res.status(200).json(success({ message: 'Logout successful.' }));
}

module.exports = { login, register, logout };
