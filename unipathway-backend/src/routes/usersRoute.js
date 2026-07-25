const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');
const authorizeSelfRead = require('../middleware/authorizeSelfRead');
const { validateId } = require('../middleware/validate/common');
const { validateUser, validateUserUpdate } = require('../middleware/validate/validateUser');
const { getAllUsers, getAdmins, getUserById, getCurrentUser, createUser, updateUser, deleteUser } = require('../controllers/usersController');

// GET / — admin only (list all users)
router.get('/',       authorize('admin'), getAllUsers);
// GET /me — any logged-in user, returns their own record (declared before /:id)
router.get('/me',     getCurrentUser);
// GET /admins — admin only; lists administrators via the Admin ORM model (declared before /:id)
router.get('/admins', authorize('admin'), getAdmins);
// GET /:id — admin sees anyone; editor and user may see only their OWN record
router.get('/:id',    validateId, authorizeSelfRead('admin'), getUserById);
router.post('/',      authorize('admin'), validateUser, createUser);
// PUT /:id — admin updates anyone; editor and user may update only their OWN record
router.put('/:id',    validateId, authorizeSelfRead('admin'), validateUserUpdate, updateUser);
router.delete('/:id', authorize('admin'), validateId, deleteUser);

module.exports = router;