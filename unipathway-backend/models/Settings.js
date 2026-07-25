const db = require('../src/database/connection');

class Settings {
  constructor(row) {
    this.userId       = row.userId;
    this.username     = row.username;
    this.email        = row.email;
    this.passwordHash = row.passwordHash;
    this.passwordSalt = row.passwordSalt;
    this.theme        = row.theme;
    this.createDate   = row.createDate;
    this.updateDate   = row.updateDate;
  }

  // Strips password fields for safe client response
  toPublic() {
    const { passwordHash, passwordSalt, ...safe } = this;
    return safe;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM Settings WHERE userId = ?', [userId]);
    return rows.length ? new Settings(rows[0]) : null;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM Settings WHERE LOWER(email) = LOWER(?)', [email]);
    return rows.length ? new Settings(rows[0]) : null;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM Settings WHERE LOWER(username) = LOWER(?)', [username]);
    return rows.length ? new Settings(rows[0]) : null;
  }

  static async create({ userId, username, email, passwordHash, passwordSalt, theme = 'light' }) {
    await db.execute(
      'INSERT INTO Settings (userId, username, email, passwordHash, passwordSalt, theme) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, email, passwordHash, passwordSalt, theme]
    );
    return Settings.findByUserId(userId);
  }

  async update({ username, email, passwordHash, passwordSalt, theme }) {
    if (username     !== undefined) this.username     = username;
    if (email        !== undefined) this.email        = email;
    if (passwordHash !== undefined) this.passwordHash = passwordHash;
    if (passwordSalt !== undefined) this.passwordSalt = passwordSalt;
    if (theme        !== undefined) this.theme        = theme;
    await db.execute(
      'UPDATE Settings SET username = ?, email = ?, passwordHash = ?, passwordSalt = ?, theme = ?, updateDate = NOW() WHERE userId = ?',
      [this.username, this.email, this.passwordHash, this.passwordSalt, this.theme, this.userId]
    );
  }

  async delete() {
    await db.execute('DELETE FROM Settings WHERE userId = ?', [this.userId]);
  }
}

module.exports = Settings;
