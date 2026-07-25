const db = require('../src/database/connection');

class University {
  constructor(row) {
    this.universityId = row.universityId;
    this.name         = row.name;
    this.type         = row.type;
    this.location     = row.location;
    this.logoUrl      = row.logoUrl;
    this.websiteUrl   = row.websiteUrl;
    this.description  = row.description;
    this.createDate   = row.createDate;
    this.updateDate   = row.updateDate;
  }

  static async findAll({ location } = {}) {
    let sql = 'SELECT * FROM Universities';
    const params = [];
    if (location) { sql += ' WHERE LOWER(location) = LOWER(?)'; params.push(location); }
    sql += ' ORDER BY universityId';
    const [rows] = await db.execute(sql, params);
    return rows.map(r => new University(r));
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM Universities WHERE universityId = ?', [id]);
    return rows.length ? new University(rows[0]) : null;
  }

  static async create({ name, type, location, logoUrl, websiteUrl, description }) {
    const [result] = await db.execute(
      'INSERT INTO Universities (name, type, location, logoUrl, websiteUrl, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type || 'University', location, logoUrl || null, websiteUrl || null, description || null]
    );
    return result.insertId;
  }

  async update({ name, type, location, logoUrl, websiteUrl, description }) {
    this.name        = name        ?? this.name;
    this.type        = type        ?? this.type;
    this.location    = location    ?? this.location;
    this.logoUrl     = logoUrl     ?? this.logoUrl;
    this.websiteUrl  = websiteUrl  ?? this.websiteUrl;
    this.description = description ?? this.description;
    await db.execute(
      'UPDATE Universities SET name = ?, type = ?, location = ?, logoUrl = ?, websiteUrl = ?, description = ?, updateDate = NOW() WHERE universityId = ?',
      [this.name, this.type, this.location, this.logoUrl, this.websiteUrl, this.description, this.universityId]
    );
  }

  async delete() {
    await db.execute('DELETE FROM Universities WHERE universityId = ?', [this.universityId]);
  }

  // JOIN: get all departments for this university
  async getDepartments() {
    const [rows] = await db.execute(
      'SELECT * FROM Departments WHERE universityId = ? ORDER BY departmentId',
      [this.universityId]
    );
    return rows;
  }
}

module.exports = University;
