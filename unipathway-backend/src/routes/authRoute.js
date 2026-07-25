const express = require('express');
const router = express.Router();
const validateLogin = require('../middleware/validate/validateLogin');
const validateRegister = require('../middleware/validate/validateRegister');
const { login, register, logout } = require('../controllers/authController');

// POST /api/auth/login — public
router.post('/login', validateLogin, login);

// POST /api/auth/register — public, self-registration (always creates 'user' role)
router.post('/register', validateRegister, register);

// POST /api/auth/logout — clears client session (stateless on server)
router.post('/logout', logout);

module.exports = router;
