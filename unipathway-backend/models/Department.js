const db = require('../src/database/connection');

class Department {
  constructor(row) {
    this.departmentId = row.departmentId;
    this.universityId = row.universityId;
    this.majorName    = row.majorName;
    this.degreeType   = row.degreeType;
    this.faculty      = row.faculty;
    this.description  = row.description;
    this.createDate   = row.createDate;
    this.updateDate   = row.updateDate;
  }

  static async findAll({ major, universityId } = {}) {
    let sql = 'SELECT * FROM Departments';
    const params = [];
    const conditions = [];
    if (major)        { conditions.push('LOWER(majorName) LIKE LOWER(?)'); params.push(`%${major}%`); }
    if (universityId) { conditions.push('universityId = ?'); params.push(universityId); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY departmentId';
    const [rows] = await db.execute(sql, params);
    return rows.map(r => new Department(r));
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM Departments WHERE departmentId = ?', [id]);
    return rows.length ? new Department(rows[0]) : null;
  }

  static async create({ universityId, majorName, degreeType, faculty, description }) {
    const [result] = await db.execute(
      'INSERT INTO Departments (universityId, majorName, degreeType, faculty, description) VALUES (?, ?, ?, ?, ?)',
      [universityId, majorName, degreeType, faculty, description || '']
    );
    return result.insertId;
  }

  async update({ universityId, majorName, degreeType, faculty, description }) {
    this.universityId = universityId ?? this.universityId;
    this.majorName    = majorName    ?? this.majorName;
    this.degreeType   = degreeType   ?? this.degreeType;
    this.faculty      = faculty      ?? this.faculty;
    this.description  = description  ?? this.description;
    await db.execute(
      'UPDATE Departments SET universityId = ?, majorName = ?, degreeType = ?, faculty = ?, description = ?, updateDate = NOW() WHERE departmentId = ?',
      [this.universityId, this.majorName, this.degreeType, this.faculty, this.description, this.departmentId]
    );
  }

  async delete() {
    await db.execute('DELETE FROM Departments WHERE departmentId = ?', [this.departmentId]);
  }

  // JOIN: get all thresholds for this department
  async getThresholds() {
    const [rows] = await db.execute(
      'SELECT * FROM AdmissionThresholds WHERE departmentId = ? ORDER BY year DESC',
      [this.departmentId]
    );
    return rows.map(r => ({
      ...r,
      sekemWeights: typeof r.sekemWeights === 'string' ? JSON.parse(r.sekemWeights) : r.sekemWeights,
      sekemBonuses: typeof r.sekemBonuses === 'string' ? JSON.parse(r.sekemBonuses) : r.sekemBonuses,
    }));
  }

  // JOIN: get university info for this department
  async getUniversity() {
    const [rows] = await db.execute(
      'SELECT * FROM Universities WHERE universityId = ?',
      [this.universityId]
    );
    return rows[0] || null;
  }
}

module.exports = Department;
