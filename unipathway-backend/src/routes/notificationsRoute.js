const express = require('express');
const router  = express.Router();
const authorize = require('../middleware/authorize');
const { getNotifications, markRead, markAllRead, deleteNotification, clearAll } = require('../controllers/notificationsController');

router.get('/',              authorize('admin', 'editor', 'user'), getNotifications);
router.put('/read-all',      authorize('admin', 'editor', 'user'), markAllRead);
router.put('/:id/read',      authorize('admin', 'editor', 'user'), markRead);
router.delete('/clear-all',  authorize('admin', 'editor', 'user'), clearAll);
router.delete('/:id',        authorize('admin', 'editor', 'user'), deleteNotification);

module.exports = router;