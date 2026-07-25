const db = require('../src/database/connection');

class AcademicScores {
  constructor(row) {
    this.academicScoresId   = row.academicScoresId;
    this.userId             = row.userId;
    this.psychometricScores = typeof row.psychometricScores === 'string' ? JSON.parse(row.psychometricScores) : row.psychometricScores;
    this.bagrutScores       = typeof row.bagrutScores       === 'string' ? JSON.parse(row.bagrutScores)       : row.bagrutScores;
    this.createDate         = row.createDate;
    this.updateDate         = row.updateDate;
  }

  static async findAll({ userId } = {}) {
    let sql = 'SELECT * FROM AcademicScores';
    const params = [];
    if (userId) { sql += ' WHERE userId = ?'; params.push(userId); }
    sql += ' ORDER BY academicScoresId';
    const [rows] = await db.execute(sql, params);
    return rows.map(r => new AcademicScores(r));
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM AcademicScores WHERE academicScoresId = ?', [id]);
    return rows.length ? new AcademicScores(rows[0]) : null;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute('SELECT * FROM AcademicScores WHERE userId = ?', [userId]);
    return rows.length ? new AcademicScores(rows[0]) : null;
  }

  static async create({ userId, psychometricScores, bagrutScores }) {
    const [result] = await db.execute(
      'INSERT INTO AcademicScores (userId, psychometricScores, bagrutScores) VALUES (?, ?, ?)',
      [userId, JSON.stringify(psychometricScores || null), JSON.stringify(bagrutScores || null)]
    );
    return result.insertId;
  }

  async update({ psychometricScores, bagrutScores }) {
    if (psychometricScores !== undefined) this.psychometricScores = psychometricScores;
    if (bagrutScores       !== undefined) this.bagrutScores       = bagrutScores;
    await db.execute(
      'UPDATE AcademicScores SET psychometricScores = ?, bagrutScores = ?, updateDate = NOW() WHERE academicScoresId = ?',
      [JSON.stringify(this.psychometricScores), JSON.stringify(this.bagrutScores), this.academicScoresId]
    );
  }

  async delete() {
    await db.execute('DELETE FROM AcademicScores WHERE academicScoresId = ?', [this.academicScoresId]);
  }

  // JOIN: get the user this score belongs to
  async getUser() {
    const [rows] = await db.execute('SELECT * FROM Users WHERE userId = ?', [this.userId]);
    return rows[0] || null;
  }
}

module.exports = AcademicScores;
