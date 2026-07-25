const db                     = require('../database/connection');
const Notification           = require('../../models/Notification');
const UserNotificationStatus = require('../../models/UserNotificationStatus');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

function currentUserId(req) {
  const id = parseInt(req.headers['x-user-id']);
  return isNaN(id) ? null : id;
}

// GET /api/notifications — get all notifications with this user's read status
async function getNotifications(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header.', {}));
    const notifications = await Notification.findAllForUser(userId);
    res.status(200).json(success(notifications));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

// PUT /api/notifications/:id/read — mark one notification as read
async function markRead(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header.', {}));
    const notificationId = parseInt(req.params.id);
    await UserNotificationStatus.markRead(userId, notificationId);
    res.status(200).json(success({ notificationId, status: 'read' }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

// PUT /api/notifications/read-all — mark all as read for this user
async function markAllRead(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header.', {}));
    await UserNotificationStatus.markAllRead(userId);
    res.status(200).json(success({ message: 'All notifications marked as read.' }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

// DELETE /api/notifications/:id — remove one notification for this user
async function deleteNotification(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header.', {}));
    const notificationId = parseInt(req.params.id);
    await db.execute(
      'DELETE FROM UserNotificationStatus WHERE userId = ? AND notificationId = ?',
      [userId, notificationId]
    );
    // Decrement counter and delete the notification entirely if no recipients remain
    await Notification.decrementAndCleanup(notificationId);
    res.status(200).json(success({ notificationId }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

// DELETE /api/notifications — remove all notifications for this user
async function clearAll(req, res) {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json(failure('UNAUTHENTICATED', 'Missing or invalid x-user-id header.', {}));
    const [result] = await db.execute(
      'DELETE FROM UserNotificationStatus WHERE userId = ?',
      [userId]
    );
    // Cleanup orphaned notifications (recipientCount <= 0)
    await db.execute(`
      DELETE FROM Notifications
      WHERE notificationId NOT IN (
        SELECT DISTINCT notificationId FROM UserNotificationStatus
      )
    `);
    res.status(200).json(success({ deleted: result.affectedRows }));
  } catch (err) { res.status(500).json(failure('INTERNAL_ERROR', err.message)); }
}

module.exports = { getNotifications, markRead, markAllRead, deleteNotification, clearAll };