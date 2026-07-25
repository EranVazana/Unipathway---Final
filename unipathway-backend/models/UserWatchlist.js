const db = require('../src/database/connection');

class UserWatchlist {
  constructor(row) {
    this.watchlistId  = row.watchlistId;
    this.userId       = row.userId;
    this.departmentId = row.departmentId;
    this.status       = row.status;
    this.sekemStatus  = row.sekemStatus;
    this.userSekem    = row.userSekem;
    this.createDate   = row.createDate;
    this.updateDate   = row.updateDate;
  }

  static async findAll({ userId, departmentId, status, sekemStatus } = {}) {
    let sql = 'SELECT * FROM UserWatchlist';
    const params = [];
    const conditions = [];
    if (userId)       { conditions.push('userId = ?');       params.push(userId); }
    if (departmentId) { conditions.push('departmentId = ?'); params.push(departmentId); }
    if (status)       { conditions.push('status = ?');       params.push(status); }
    if (sekemStatus)  { conditions.push('sekemStatus = ?');  params.push(sekemStatus); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY watchlistId';
    const [rows] = await db.execute(sql, params);
    return rows.map(r => new UserWatchlist(r));
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM UserWatchlist WHERE watchlistId = ?', [id]);
    return rows.length ? new UserWatchlist(rows[0]) : null;
  }

  static async findByUser(userId) {
    const [rows] = await db.execute('SELECT * FROM UserWatchlist WHERE userId = ?', [userId]);
    return rows.map(r => new UserWatchlist(r));
  }

  static async create({ userId, departmentId, status, sekemStatus, userSekem }) {
    const [result] = await db.execute(
      'INSERT INTO UserWatchlist (userId, departmentId, status, sekemStatus, userSekem) VALUES (?, ?, ?, ?, ?)',
      [userId, departmentId, status || 'Interested', sekemStatus || 'no-data', userSekem || null]
    );
    return result.insertId;
  }

  async update({ status, sekemStatus, userSekem }) {
    if (status      !== undefined) this.status      = status;
    if (sekemStatus !== undefined) this.sekemStatus = sekemStatus;
    if (userSekem   !== undefined) this.userSekem   = userSekem;
    await db.execute(
      'UPDATE UserWatchlist SET status = ?, sekemStatus = ?, userSekem = ?, updateDate = NOW() WHERE watchlistId = ?',
      [this.status, this.sekemStatus, this.userSekem, this.watchlistId]
    );
  }

  async delete() {
    await db.execute('DELETE FROM UserWatchlist WHERE watchlistId = ?', [this.watchlistId]);
  }

  // Recalculates sekem for all watchlist entries of a user after scores change
  static async recalculateForUser(userId, scoresEntry, thresholds) {
    const entries = await UserWatchlist.findByUser(userId);
    const { calculateUserSekem, deriveSekemStatus, getLatestThreshold } = require('../src/utils/sekemCalculator');
    for (const entry of entries) {
      const threshold = getLatestThreshold(thresholds, entry.departmentId);
      const sekemStatus = deriveSekemStatus(scoresEntry, threshold);
      const userSekem = threshold ? calculateUserSekem(scoresEntry, threshold) : null;
      await db.execute(
        'UPDATE UserWatchlist SET sekemStatus = ?, userSekem = ?, updateDate = NOW() WHERE watchlistId = ?',
        [sekemStatus, userSekem, entry.watchlistId]
      );
    }
    return entries.length;
  }

  // Reset sekem for all watchlist entries of a user (after scores deleted)
  static async resetSekemForUser(userId) {
    await db.execute(
      "UPDATE UserWatchlist SET sekemStatus = 'no-data', userSekem = NULL, updateDate = NOW() WHERE userId = ?",
      [userId]
    );
  }

  // JOIN: get the department info for this watchlist entry
  async getDepartment() {
    const [rows] = await db.execute(`
      SELECT d.*, u.name AS universityName
      FROM Departments d
      JOIN Universities u ON d.universityId = u.universityId
      WHERE d.departmentId = ?
    `, [this.departmentId]);
    return rows[0] || null;
  }
}

module.exports = UserWatchlist;