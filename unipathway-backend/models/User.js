const db = require('../src/database/connection');

class User {
  constructor(row) {
    this.userId     = row.userId;
    this.firstName  = row.firstName;
    this.lastName   = row.lastName;
    this.userRole   = row.userRole;
    this.createDate = row.createDate;
    this.updateDate = row.updateDate;
  }

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM Users ORDER BY userId');
    return rows.map(r => new User(r));
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE userId = ?', [id]);
    return rows.length ? new User(rows[0]) : null;
  }

  static async create({ firstName, lastName, userRole }) {
    const [result] = await db.execute(
      'INSERT INTO Users (firstName, lastName, userRole) VALUES (?, ?, ?)',
      [firstName, lastName, userRole]
    );
    return result.insertId;
  }

  async update({ firstName, lastName, userRole }) {
    this.firstName  = firstName  ?? this.firstName;
    this.lastName   = lastName   ?? this.lastName;
    this.userRole   = userRole   ?? this.userRole;
    await db.execute(
      'UPDATE Users SET firstName = ?, lastName = ?, userRole = ?, updateDate = NOW() WHERE userId = ?',
      [this.firstName, this.lastName, this.userRole, this.userId]
    );
  }

  async delete() {
    await db.execute('DELETE FROM Users WHERE userId = ?', [this.userId]);
  }

  // JOIN: get user with their settings (non-sensitive)
  static async findAllWithSettings() {
    const [rows] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.userRole, u.createDate, u.updateDate,
             s.email, s.username, s.theme
      FROM Users u
      LEFT JOIN Settings s ON u.userId = s.userId
      ORDER BY u.userId
    `);
    return rows;
  }

  static async findByIdWithSettings(id) {
    const [rows] = await db.execute(`
      SELECT u.userId, u.firstName, u.lastName, u.userRole, u.createDate, u.updateDate,
             s.email, s.username, s.theme
      FROM Users u
      LEFT JOIN Settings s ON u.userId = s.userId
      WHERE u.userId = ?
    `, [id]);
    return rows[0] || null;
  }
}

module.exports = User;
