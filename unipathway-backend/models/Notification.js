const db = require('../src/database/connection');

class Notification {
  constructor(row) {
    this.notificationId  = row.notificationId;
    this.type            = row.type;
    this.action          = row.action;
    this.title           = row.title;
    this.message         = row.message;
    this.resourceId      = row.resourceId;
    this.recipientCount  = row.recipientCount;
    this.createDate      = row.createDate;
  }

  static async create({ type, action, title, message, resourceId }) {
    const [result] = await db.execute(
      'INSERT INTO Notifications (type, action, title, message, resourceId, recipientCount) VALUES (?, ?, ?, ?, ?, 0)',
      [type, action, title, message, resourceId]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM Notifications WHERE notificationId = ?', [id]);
    return rows.length ? new Notification(rows[0]) : null;
  }

  // JOIN: get all notifications with this user's read status
  static async findAllForUser(userId) {
    const [rows] = await db.execute(`
      SELECT
        n.notificationId, n.type, n.action, n.title, n.message, n.resourceId, n.createDate,
        COALESCE(uns.status, 'unread') AS status
      FROM Notifications n
      INNER JOIN UserNotificationStatus uns
        ON n.notificationId = uns.notificationId AND uns.userId = ?
      ORDER BY n.createDate DESC
    `, [userId]);
    return rows;
  }

  // Set recipientCount after status rows are created
  static async setRecipientCount(notificationId, count) {
    await db.execute(
      'UPDATE Notifications SET recipientCount = ? WHERE notificationId = ?',
      [count, notificationId]
    );
  }

  // Decrement recipientCount and delete the notification if it reaches 0
  static async decrementAndCleanup(notificationId) {
    await db.execute(
      'UPDATE Notifications SET recipientCount = recipientCount - 1 WHERE notificationId = ?',
      [notificationId]
    );
    const [rows] = await db.execute(
      'SELECT recipientCount FROM Notifications WHERE notificationId = ?',
      [notificationId]
    );
    if (rows.length && rows[0].recipientCount <= 0) {
      // CASCADE deletes all UserNotificationStatus rows automatically
      await db.execute('DELETE FROM Notifications WHERE notificationId = ?', [notificationId]);
    }
  }

  static async delete(id) {
    await db.execute('DELETE FROM Notifications WHERE notificationId = ?', [id]);
  }
}

module.exports = Notification;