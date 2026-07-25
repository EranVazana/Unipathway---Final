const db = require('../src/database/connection');

class UserNotificationStatus {
  // Mark a single notification as read for a user (upsert)
  static async markRead(userId, notificationId) {
    await db.execute(`
      INSERT INTO UserNotificationStatus (userId, notificationId, status)
      VALUES (?, ?, 'read')
      ON DUPLICATE KEY UPDATE status = 'read'
    `, [userId, notificationId]);
  }

  // Mark all notifications as read for a user
  static async markAllRead(userId) {
    // Get all notification IDs not yet marked read for this user
    const [notifications] = await db.execute(`
      SELECT n.notificationId
      FROM Notifications n
      LEFT JOIN UserNotificationStatus uns
        ON n.notificationId = uns.notificationId AND uns.userId = ?
      WHERE COALESCE(uns.status, 'unread') = 'unread'
    `, [userId]);

    for (const { notificationId } of notifications) {
      await db.execute(`
        INSERT INTO UserNotificationStatus (userId, notificationId, status)
        VALUES (?, ?, 'read')
        ON DUPLICATE KEY UPDATE status = 'read'
      `, [userId, notificationId]);
    }
  }

  static async createForAllUsers(notificationId, excludeUserId = null) {
    const [users] = await db.execute(
      "SELECT userId FROM Users WHERE userRole = 'user'"
    );
    const recipients = excludeUserId
      ? users.filter(u => u.userId !== excludeUserId)
      : users;

    for (const { userId } of recipients) {
      await db.execute(`
        INSERT IGNORE INTO UserNotificationStatus (userId, notificationId, status)
        VALUES (?, ?, 'unread')
      `, [userId, notificationId]);
    }
    const Notification = require('./Notification');
    await Notification.setRecipientCount(notificationId, recipients.length);
    return recipients.length;
  }
}

module.exports = UserNotificationStatus;