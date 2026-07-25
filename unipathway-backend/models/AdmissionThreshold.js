const db = require('../src/database/connection');

class AdmissionThreshold {
  constructor(row) {
    this.thresholdId  = row.thresholdId;
    this.departmentId = row.departmentId;
    this.year         = row.year;
    this.sekemType    = row.sekemType;
    this.sekemWeights = typeof row.sekemWeights === 'string' ? JSON.parse(row.sekemWeights) : row.sekemWeights;
    this.sekemBonuses = typeof row.sekemBonuses === 'string' ? JSON.parse(row.sekemBonuses) : row.sekemBonuses;
    this.minSekem     = row.minSekem;
    this.createDate   = row.createDate;
    this.updateDate   = row.updateDate;
  }

  static async findAll({ departmentId, year } = {}) {
    let sql = 'SELECT * FROM AdmissionThresholds';
    const params = [];
    const conditions = [];
    if (departmentId) { conditions.push('departmentId = ?'); params.push(departmentId); }
    if (year)         { conditions.push('year = ?');         params.push(year); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY departmentId, year DESC';
    const [rows] = await db.execute(sql, params);
    return rows.map(r => new AdmissionThreshold(r));
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM AdmissionThresholds WHERE thresholdId = ?', [id]);
    return rows.length ? new AdmissionThreshold(rows[0]) : null;
  }

  // Returns the most recent threshold for a department (used by sekem calculator)
  static async findLatestByDepartment(departmentId) {
    const [rows] = await db.execute(
      'SELECT * FROM AdmissionThresholds WHERE departmentId = ? ORDER BY year DESC LIMIT 1',
      [departmentId]
    );
    return rows.length ? new AdmissionThreshold(rows[0]) : null;
  }

  static async create({ departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem }) {
    const [result] = await db.execute(
      'INSERT INTO AdmissionThresholds (departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem) VALUES (?, ?, ?, ?, ?, ?)',
      [departmentId, year, sekemType, JSON.stringify(sekemWeights), JSON.stringify(sekemBonuses || []), minSekem]
    );
    return result.insertId;
  }

  async update({ departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem }) {
    this.departmentId = departmentId ?? this.departmentId;
    this.year         = year         ?? this.year;
    this.sekemType    = sekemType    ?? this.sekemType;
    this.sekemWeights = sekemWeights ?? this.sekemWeights;
    this.sekemBonuses = sekemBonuses ?? this.sekemBonuses;
    this.minSekem     = minSekem     ?? this.minSekem;
    await db.execute(
      'UPDATE AdmissionThresholds SET departmentId = ?, year = ?, sekemType = ?, sekemWeights = ?, sekemBonuses = ?, minSekem = ?, updateDate = NOW() WHERE thresholdId = ?',
      [this.departmentId, this.year, this.sekemType, JSON.stringify(this.sekemWeights), JSON.stringify(this.sekemBonuses), this.minSekem, this.thresholdId]
    );
  }

  async delete() {
    await db.execute('DELETE FROM AdmissionThresholds WHERE thresholdId = ?', [this.thresholdId]);
  }

  // JOIN: get the department for this threshold
  async getDepartment() {
    const [rows] = await db.execute('SELECT * FROM Departments WHERE departmentId = ?', [this.departmentId]);
    return rows[0] || null;
  }
}

module.exports = AdmissionThreshold;
