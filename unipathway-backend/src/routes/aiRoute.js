const express    = require('express');
const router     = express.Router();
const authorize  = require('../middleware/authorize');
const { chat, getWelcome } = require('../controllers/aiController');

router.get('/welcome', authorize('admin', 'editor', 'user'), getWelcome);
router.post('/chat',   authorize('admin', 'editor', 'user'), chat);

module.exports = router;