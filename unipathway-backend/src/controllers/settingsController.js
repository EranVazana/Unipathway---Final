const Settings = require('../../models/Settings');
const User     = require('../../models/User');
const { hashPassword } = require('../utils/passwordHasher');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

function currentUserId(req) {
  const id = parseInt(req.headers['x-user-id']);
  return isNaN(id) ? null : id;
}

async function readSettingsFor(userId, res) {
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`, { resource: 'user', id: userId }));
    const entry = await Settings.findByUserId(userId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Settings for user ${userId} not found.`, {}));
    res.status(200).json(success(entry.toPublic()));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateSettingsFor(userId, req, res) {
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json(failure('NOT_FOUND', `User with id ${userId} not found.`, { resource: 'user', id: userId }));
    const entry = await Settings.findByUserId(userId);
    if (!entry) return res.status(404).json(failure('NOT_FOUND', `Settings for user ${userId} not found.`, {}));
    const { username, email, password, theme } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email    !== undefined) updates.email    = email;
    if (theme    !== undefined) updates.theme    = theme;
    if (password !== undefined) {
      const { salt, hash } = hashPassword(password);
      updates.passwordSalt = salt;
      updates.passwordHash = hash;
    }
    await entry.update(updates);
    res.status(200).json(success(entry.toPublic()));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getSettings(req, res) {
  const userId = currentUserId(req);
  if (userId === null) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header. Please log in.', {}));
  return readSettingsFor(userId, res);
}

async function updateSettings(req, res) {
  const userId = currentUserId(req);
  if (userId === null) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header. Please log in.', {}));
  return updateSettingsFor(userId, req, res);
}

async function getSettingsById(req, res) { return readSettingsFor(req.parsedId, res); }
async function updateSettingsById(req, res) { return updateSettingsFor(req.parsedId, req, res); }

module.exports = { getSettings, updateSettings, getSettingsById, updateSettingsById };
