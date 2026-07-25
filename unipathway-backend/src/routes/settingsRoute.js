const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const { validateId } = require('../middleware/validate/common');
const validateSettings = require('../middleware/validate/validateSettings');
const { getSettings, updateSettings, getSettingsById, updateSettingsById } = require('../controllers/settingsController');

// Current user's own settings — any logged-in role (admin / editor / user)
// Self-scoped automatically via the x-user-id header.
router.get('/',        authorize('admin', 'editor', 'user'), getSettings);
router.put('/',        authorize('admin', 'editor', 'user'), validateSettings, updateSettings);

// Admin-only: view/edit ANY user's settings by id
router.get('/:id',     authorize('admin'), validateId, getSettingsById);
router.put('/:id',     authorize('admin'), validateId, validateSettings, updateSettingsById);

module.exports = router;