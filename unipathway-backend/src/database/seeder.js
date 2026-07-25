const db = require('./connection');
const { users }               = require('../../models/usersData');
const { settings }            = require('../../models/settingsData');
const { universities }        = require('../../models/universitiesData');
const { departments }         = require('../../models/departmentsData');
const { admissionThresholds } = require('../../models/admissionThresholdsData');
const { userWatchlist }       = require('../../models/userWatchlistData');
const { academicScores }      = require('../../models/academicScoresData');

// Convert ISO 8601 string to MySQL DATETIME format
function toMySQL(isoStr) {
  if (!isoStr) return null;
  return isoStr.replace('T', ' ').replace('Z', '').split('.')[0];
}

async function seed() {
  const [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
  if (rows[0].count > 0) { console.log('  ↳ Already seeded, skipping.'); return; }

  console.log('  ↳ Seeding Users...');
  for (const u of users) {
    await db.execute(
      'INSERT INTO Users (userId, firstName, lastName, userRole, createDate, updateDate) VALUES (?, ?, ?, ?, ?, ?)',
      [u.userId, u.firstName, u.lastName, u.userRole, toMySQL(u.createDate), toMySQL(u.updateDate)]
    );
  }

  console.log('  ↳ Seeding Settings...');
  for (const s of settings) {
    await db.execute(
      'INSERT INTO Settings (userId, username, email, passwordHash, passwordSalt, theme) VALUES (?, ?, ?, ?, ?, ?)',
      [s.userId, s.username, s.email, s.passwordHash, s.passwordSalt, s.theme || 'light']
    );
  }

  console.log('  ↳ Seeding Universities...');
  for (const u of universities) {
    await db.execute(
      'INSERT INTO Universities (universityId, name, type, location, logoUrl, websiteUrl, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [u.universityId, u.name, u.type, u.location, u.logoUrl || null, u.websiteUrl || null, u.description || null]
    );
  }

  console.log('  ↳ Seeding Departments...');
  for (const d of departments) {
    await db.execute(
      'INSERT INTO Departments (departmentId, universityId, majorName, degreeType, faculty, description, createDate, updateDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [d.departmentId, d.universityId, d.majorName, d.degreeType, d.faculty, d.description || '', toMySQL(d.createDate), toMySQL(d.updateDate)]
    );
  }

  console.log('  ↳ Seeding AdmissionThresholds...');
  for (const t of admissionThresholds) {
    await db.execute(
      'INSERT INTO AdmissionThresholds (thresholdId, departmentId, year, sekemType, sekemWeights, sekemBonuses, minSekem) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [t.thresholdId, t.departmentId, t.year, t.sekemType, JSON.stringify(t.sekemWeights), JSON.stringify(t.sekemBonuses || []), t.minSekem]
    );
  }

  console.log('  ↳ Seeding UserWatchlist...');
  for (const w of userWatchlist) {
    await db.execute(
      'INSERT INTO UserWatchlist (watchlistId, userId, departmentId, status, sekemStatus, userSekem) VALUES (?, ?, ?, ?, ?, ?)',
      [w.watchlistId, w.userId, w.departmentId, w.status, w.sekemStatus, w.userSekem || null]
    );
  }

  console.log('  ↳ Seeding AcademicScores...');
  for (const a of academicScores) {
    await db.execute(
      'INSERT INTO AcademicScores (academicScoresId, userId, psychometricScores, bagrutScores, createDate, updateDate) VALUES (?, ?, ?, ?, ?, ?)',
      [a.academicScoresId, a.userId, JSON.stringify(a.psychometricScores), JSON.stringify(a.bagrutScores), toMySQL(a.createDate), toMySQL(a.updateDate)]
    );
  }

  console.log('  ↳ Seeding complete.');
}

module.exports = seed;