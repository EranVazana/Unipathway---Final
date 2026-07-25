const db = require('../src/database/connection');

/**
 * Admin ORM model.
 *
 * Admins are Users whose userRole is 'admin'. This model is bound to the same
 * Users table and always scopes its queries to the admin role, giving a
 * dedicated ORM entity for administrator records (and a JOIN to Settings for
 * their contact details).
 */
class Admin {
  constructor(row) {
    this.userId     = row.userId;
    this.firstName  = row.firstName;
    this.lastName   = row.lastName;
    this.userRole   = row.userRole;
    this.email      = row.email;
    this.username   = row.username;
    this.createDate = row.createDate;
    this.updateDate = row.updateDate;
  }

  // JOIN Users ↔ Settings, filtered to admins only
  static async findAll() {
    const [rows] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.userRole, u.createDate, u.updateDate,
             s.email, s.username
      FROM Users u
      LEFT JOIN Settings s ON u.userId = s.userId
      WHERE u.userRole = 'admin'
      ORDER BY u.userId
    `);
    return rows.map(r => new Admin(r));
  }

  static async findById(id) {
    const [rows] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.userRole, u.createDate, u.updateDate,
             s.email, s.username
      FROM Users u
      LEFT JOIN Settings s ON u.userId = s.userId
      WHERE u.userRole = 'admin' AND u.userId = ?
    `, [id]);
    return rows.length ? new Admin(rows[0]) : null;
  }

  // Count of administrators — small helper that proves the model is functional
  static async count() {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS count FROM Users WHERE userRole = 'admin'"
    );
    return rows[0].count;
  }

  // Is a given user an admin?
  static async isAdmin(userId) {
    const [rows] = await db.execute(
      "SELECT 1 FROM Users WHERE userId = ? AND userRole = 'admin' LIMIT 1",
      [userId]
    );
    return rows.length > 0;
  }
}

module.exports = Admin;
