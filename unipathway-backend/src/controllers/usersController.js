const User     = require('../../models/User');
const Admin    = require('../../models/Admin');
const Settings = require('../../models/Settings');
const { hashPassword } = require('../utils/passwordHasher');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

async function getAllUsers(req, res) {
  try {
    const users = await User.findAllWithSettings();
    res.status(200).json(success(users));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getAdmins(req, res) {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(success(admins));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getCurrentUser(req, res) {
  try {
    const currentId = parseInt(req.headers['x-user-id']);
    if (isNaN(currentId)) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header. Please log in.', {}));
    const user = await User.findByIdWithSettings(currentId);
    if (!user) return res.status(404).json(failure('NOT_FOUND', `User with id ${currentId} not found.`, { resource: 'user', id: currentId }));
    res.status(200).json(success(user));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function getUserById(req, res) {
  try {
    const user = await User.findById(req.parsedId);
    if (!user) return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
    res.status(200).json(success(user));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function createUser(req, res) {
  try {
    const { firstName, lastName, userRole, username, email } = req.body;
    const userId = await User.create({ firstName, lastName, userRole });
    await Settings.create({
      userId,
      username,
      email,
      passwordHash: req.hashedCredentials.hash,
      passwordSalt: req.hashedCredentials.salt,
      theme: 'light'
    });
    res.status(201).json(success({ userId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateUser(req, res) {
  try {
    const user = await User.findById(req.parsedId);
    if (!user) return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
    const { firstName, lastName, userRole } = req.body;
    if (req.isSelf && userRole !== user.userRole) {
      return res.status(403).json(failure('FORBIDDEN', 'Users cannot change their own role.', { field: 'userRole' }));
    }
    await user.update({ firstName, lastName, userRole });
    res.status(200).json(success({ userId: user.userId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function updateUserSettings(req, res) {
  try {
    const user = await User.findById(req.parsedId);
    if (!user) return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
    let entry = await Settings.findByUserId(req.parsedId);
    const { username, email, password } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (email    !== undefined) updates.email    = email;
    if (password !== undefined) {
      const { salt, hash } = hashPassword(password);
      updates.passwordSalt = salt;
      updates.passwordHash = hash;
    }
    await entry.update(updates);
    res.status(200).json(success(entry.toPublic()));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.parsedId);
    if (!user) return res.status(404).json(failure('NOT_FOUND', `User with id ${req.parsedId} not found.`, { resource: 'user', id: req.parsedId }));
    await user.delete(); // CASCADE handles Settings, AcademicScores, UserWatchlist
    res.status(200).json(success({ userId: req.parsedId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

module.exports = { getAllUsers, getUserById, getCurrentUser, createUser, updateUser, updateUserSettings, deleteUser, getAdmins };
