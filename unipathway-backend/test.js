/**
 * UniPathway API - Automated Test Script
 * Run with: node test.js
 * Make sure the server is running and the DB is connected first
 */

console.clear();

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const results = [];

async function request(method, path, { body, role, userId } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (role)   headers['x-user-role'] = role;
  if (userId) headers['x-user-id']   = String(userId);

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  return { status: res.status, data };
}

const get  = (path, opts)       => request('GET',    path, opts);
const post = (path, body, opts) => request('POST',   path, { body, ...opts });
const put  = (path, body, opts) => request('PUT',    path, { body, ...opts });
const del  = (path, opts)       => request('DELETE', path, opts);

function assert(testName, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed++;
    results.push(`  ✅ ${testName}`);
  } else {
    failed++;
    results.push(`  ❌ ${testName} — expected ${expected}, got ${actual}`);
  }
}

function section(name) {
  results.push(`\n📁 ${name}`);
}

// Sample full bagrut object for tests
const sampleBagrut = {
  bibleStudies:     { grade: 80, units: 2 },
  literature:       { grade: 78, units: 2 },
  hebrewExpression: { grade: 82, units: 2 },
  history:          { grade: 75, units: 2 },
  civics:           { grade: 79, units: 2 },
  mathematics:      { grade: 88, units: 4 },
  english:          { grade: 91, units: 5 }
};
const samplePsychometric = { verbal: 110, quantitative: 120, english: 115 };

// ──────────────────────────────────────────────────────────────────────
// ─── AUTH: REGISTER ──────────────────────────────────────────────────────────
async function testRegister() {
  section('POST /api/auth/register');

  // Unique credentials per run — the DB persists between runs
  const stamp = Date.now();
  const regEmail    = `reg_${stamp}@unipathway-test.com`;
  const regUsername = `reg_${stamp}`.slice(0, 20);

  let r = await post('/auth/register', { firstName: 'Test' });
  assert('POST /register (missing fields) → 400',          r.status, 400);

  r = await post('/auth/register', {
    firstName: 'Test', lastName: 'User', username: regUsername,
    email: 'not-an-email', password: 'pass1234'
  });
  assert('POST /register (invalid email) → 400',           r.status, 400);

  r = await post('/auth/register', {
    firstName: 'Test', lastName: 'User', username: 'ab',
    email: regEmail, password: 'pass1234'
  });
  assert('POST /register (short username) → 400',          r.status, 400);

  r = await post('/auth/register', {
    firstName: 'Test', lastName: 'User', username: 'bad name!',
    email: regEmail, password: 'pass1234'
  });
  assert('POST /register (invalid username format) → 400', r.status, 400);

  r = await post('/auth/register', {
    firstName: 'Test', lastName: 'User', username: regUsername,
    email: regEmail, password: '12345'
  });
  assert('POST /register (short password) → 400',          r.status, 400);

  r = await post('/auth/register', {
    firstName: 'Test', lastName: 'User', username: regUsername,
    email: 'dana@unipathway.com', password: 'pass1234'
  });
  assert('POST /register (duplicate email) → 400',         r.status, 400);

  r = await post('/auth/register', {
    firstName: 'Test', lastName: 'User', username: 'danac',
    email: regEmail, password: 'pass1234'
  });
  assert('POST /register (duplicate username) → 400',      r.status, 400);

  // Happy path — role is forced to 'user' even if the caller supplies another
  r = await post('/auth/register', {
    firstName: 'Reg', lastName: 'Tester', username: regUsername,
    email: regEmail, password: 'pass1234', userRole: 'admin'
  });
  assert('POST /register → 201',                           r.status, 201);
  assert('POST /register → returns user object',           typeof r.data.data.user.userId, 'number');
  assert('POST /register → role is user',                  r.data.data.user.userRole, 'user');
  assert('POST /register → no passwordHash leaked',        r.data.data.user.passwordHash, undefined);
  assert('POST /register → no passwordSalt leaked',        r.data.data.user.passwordSalt, undefined);
  const newRegUserId = r.data.data.user.userId;

  // Default academic scores must be seeded (persisted in MySQL)
  r = await get(`/academic-scores?userId=${newRegUserId}`, { role: 'admin' });
  const hasDefaultScores = r.data.data.some(s => s.userId === newRegUserId);
  assert('POST /register → default academic scores seeded', hasDefaultScores, true);

  // Registered user can immediately log in
  r = await post('/auth/login', { email: regEmail, password: 'pass1234' });
  assert('Registered user can log in → 200',               r.status, 200);
  assert('Login after register → correct userId',          r.data.data.user.userId, newRegUserId);

  // Cannot register again with the same email
  r = await post('/auth/register', {
    firstName: 'Reg', lastName: 'Again', username: `x${regUsername}`.slice(0, 20),
    email: regEmail, password: 'pass1234'
  });
  assert('POST /register (duplicate email after reg) → 400', r.status, 400);
}

async function testUsers() {
  section('USERS');

  // GET / — admin only
  let r = await get('/users', { role: 'admin' });
  assert('GET /users (admin) → 200',           r.status, 200);
  assert('GET /users → returns array', Array.isArray(r.data.data), true);

  // editor cannot list users
  r = await get('/users', { role: 'editor' });
  assert('GET /users (editor) → 403',          r.status, 403);

  // user cannot list all users
  r = await get('/users', { role: 'user', userId: 5 });
  assert('GET /users (user) → 403',            r.status, 403);

  // GET /admins — admin-only listing via the Admin ORM model
  r = await get('/users/admins', { role: 'admin' });
  assert('GET /users/admins (admin) → 200',    r.status, 200);
  assert('GET /users/admins → returns array',  Array.isArray(r.data.data), true);
  assert('GET /users/admins → only admins',    r.data.data.every(u => u.userRole === 'admin'), true);
  r = await get('/users/admins', { role: 'user', userId: 5 });
  assert('GET /users/admins (user) → 403',     r.status, 403);

  // GET /:id — admin can read anyone
  r = await get('/users/1', { role: 'admin' });
  assert('GET /users/1 (admin) → 200',         r.status, 200);
  assert('GET /users/1 → correct id',  r.data.data.userId, 1);

  // user can read their OWN record
  r = await get('/users/5', { role: 'user', userId: 5 });
  assert('GET own user (user) → 200',          r.status, 200);

  // user cannot read another user's record
  r = await get('/users/1', { role: 'user', userId: 5 });
  assert('GET other user (user) → 403',        r.status, 403);

  // editor can read their OWN record (Yael = userId 3)
  r = await get('/users/3', { role: 'editor', userId: 3 });
  assert('GET own user (editor) → 200',        r.status, 200);
  assert('GET own user (editor) → correct id', r.data.data.userId, 3);

  // editor cannot read ANOTHER user's record
  r = await get('/users/1', { role: 'editor', userId: 3 });
  assert('GET other user (editor) → 403',      r.status, 403);

  r = await get('/users/999', { role: 'admin' });
  assert('GET /users/999 → 404',       r.status, 404);

  // POST - editor no longer allowed
  r = await post('/users', { firstName: 'X', lastName: 'Y', userRole: 'user' }, { role: 'editor' });
  assert('POST /users (editor role) → 403',  r.status, 403);

  // POST - user not allowed
  r = await post('/users', { firstName: 'X', lastName: 'Y', userRole: 'user' }, { role: 'user' });
  assert('POST /users (user role) → 403',    r.status, 403);

  // POST - missing fields
  r = await post('/users', { firstName: 'Tal' }, { role: 'admin' });
  assert('POST /users (missing fields) → 400', r.status, 400);

  // POST - missing username specifically
  r = await post('/users', {
    firstName: 'NoUser', lastName: 'Name', userRole: 'user',
    email: `nouser${Date.now()}@unipathway.com`, password: 'pass1234'
  }, { role: 'admin' });
  assert('POST /users (missing username) → 400', r.status, 400);

  // POST - invalid username format
  r = await post('/users', {
    firstName: 'Bad', lastName: 'Username', userRole: 'user',
    username: 'a', email: `baduser${Date.now()}@unipathway.com`, password: 'pass1234'
  }, { role: 'admin' });
  assert('POST /users (invalid username format) → 400', r.status, 400);

  // POST - invalid role value
  r = await post('/users', { firstName: 'X', lastName: 'Y', userRole: 'superadmin' }, { role: 'admin' });
  assert('POST /users (invalid userRole) → 400', r.status, 400);

  // POST - success
  r = await post('/users', { firstName: 'Test', lastName: 'User', userRole: 'user', username: `Test${Date.now()}`, email: `test${Date.now()}@unipathway.com`, password: 'pass1234' }, { role: 'admin' });
  assert('POST /users → 201',          r.status, 201);
  const newUserId = r.data.data.userId;

  // PUT - editor cannot update ANOTHER user's record
  r = await put(`/users/${newUserId}`, { firstName: 'X', lastName: 'Y', userRole: 'user' }, { role: 'editor', userId: 3 });
  assert('PUT other user (editor) → 403',   r.status, 403);

  // PUT - admin allowed
  r = await put(`/users/${newUserId}`, { firstName: 'Updated', lastName: 'User', userRole: 'user' }, { role: 'admin' });
  assert('PUT /users/:id → 200',       r.status, 200);

  r = await get(`/users/${newUserId}`, { role: 'admin' });
  assert('GET after PUT → firstName updated', r.data.data.firstName, 'Updated');

  // DELETE - editor forbidden
  r = await del(`/users/${newUserId}`, { role: 'editor' });
  assert('DELETE /users (editor) → 403', r.status, 403);

  // DELETE - admin
  r = await del(`/users/${newUserId}`, { role: 'admin' });
  assert('DELETE /users/:id → 200',    r.status, 200);

  r = await get(`/users/${newUserId}`, { role: 'admin' });
  assert('GET after DELETE → 404',     r.status, 404);

  // ─── manager-as-alias for editor ───
  // POST university as 'manager' should be accepted (alias for editor)
  r = await post('/universities', { name: 'AliasTestU', location: 'X' }, { role: 'manager' });
  assert('POST /universities (manager alias) → 201',  r.status, 201);
  if (r.data.data?.universityId) {
    await del(`/universities/${r.data.data.universityId}`, { role: 'admin' });
  }

  // POST /users with userRole='manager' should normalize to 'editor'
  r = await post('/users', { firstName: 'Mgr', lastName: 'Alias', userRole: 'manager', username: `Mgr${Date.now()}`, email: `mgr${Date.now()}@unipathway.com`, password: 'pass1234' }, { role: 'admin' });
  assert('POST /users (userRole=manager normalized) → 201', r.status, 201);
  const mgrAliasId = r.data.data.userId;
  r = await get(`/users/${mgrAliasId}`, { role: 'admin' });
  assert('Manager normalized to editor in storage',  r.data.data.userRole, 'editor');
  await del(`/users/${mgrAliasId}`, { role: 'admin' });

  // ─── PUT Self-Update ───
  // Create a test user, then have them update themselves
  let createR = await post('/users', { firstName: 'Self', lastName: 'Test', userRole: 'user', username: `Self${Date.now()}`, email: `self${Date.now()}@unipathway.com`, password: 'pass1234' }, { role: 'admin' });
  const selfUserId = createR.data.data.userId;

  // User updates their own record - should succeed
  r = await put(`/users/${selfUserId}`,
    { firstName: 'SelfUpdated', lastName: 'Test', userRole: 'user' },
    { role: 'user', userId: selfUserId });
  assert('PUT self-update (matching x-user-id) → 200', r.status, 200);

  r = await get(`/users/${selfUserId}`, { role: 'admin' });
  assert('Self-update persisted firstName',          r.data.data.firstName, 'SelfUpdated');

  // User tries to update someone else - should be forbidden
  r = await put(`/users/1`,
    { firstName: 'Hacker', lastName: 'X', userRole: 'admin' },
    { role: 'user', userId: selfUserId });
  assert('PUT other user (user role) → 403',         r.status, 403);

  // User tries to escalate their own role - should be forbidden
  r = await put(`/users/${selfUserId}`,
    { firstName: 'SelfUpdated', lastName: 'Test', userRole: 'admin' },
    { role: 'user', userId: selfUserId });
  assert('PUT self with role change → 403',          r.status, 403);

  // User with no x-user-id header - should be forbidden
  r = await put(`/users/${selfUserId}`,
    { firstName: 'X', lastName: 'Y', userRole: 'user' },
    { role: 'user' });
  assert('PUT user role with no x-user-id → 403',    r.status, 403);

  // Editor updates their OWN record (Yael = userId 3) — allowed
  r = await put(`/users/3`,
    { firstName: 'Yael', lastName: 'Levi', userRole: 'editor' },
    { role: 'editor', userId: 3 });
  assert('PUT self-update (editor) → 200',           r.status, 200);

  // Editor tries to escalate their own role — forbidden
  r = await put(`/users/3`,
    { firstName: 'Yael', lastName: 'Levi', userRole: 'admin' },
    { role: 'editor', userId: 3 });
  assert('PUT self role change (editor) → 403',      r.status, 403);

  // Admin can still PUT anyone (no x-user-id needed)
  r = await put(`/users/${selfUserId}`,
    { firstName: 'AdminEdit', lastName: 'Test', userRole: 'user' },
    { role: 'admin' });
  assert('PUT (admin, no x-user-id) → 200',          r.status, 200);

  // Cleanup
  await del(`/users/${selfUserId}`, { role: 'admin' });
}

// ──────────────────────────────────────────────────────────────────────
async function testUniversities() {
  section('UNIVERSITIES');

  let r = await get('/universities');
  assert('GET /universities → 200',          r.status, 200);

  r = await get('/universities?location=Haifa');
  assert('GET ?location=Haifa → filtered',   r.data.data.every(u => u.location === 'Haifa'), true);

  r = await get('/universities/999');
  assert('GET /universities/999 → 404',      r.status, 404);

  // editor allowed
  r = await post('/universities', { name: 'Test U', location: 'Test City' }, { role: 'editor' });
  assert('POST /universities (editor) → 201', r.status, 201);
  const uniId = r.data.data.universityId;

  // user forbidden
  r = await post('/universities', { name: 'Y', location: 'Z' }, { role: 'user' });
  assert('POST /universities (user) → 403',  r.status, 403);

  r = await put(`/universities/${uniId}`, { name: 'Updated', location: 'Y' }, { role: 'editor' });
  assert('PUT /universities (editor) → 200', r.status, 200);

  // editor cannot delete
  r = await del(`/universities/${uniId}`, { role: 'editor' });
  assert('DELETE /universities (editor) → 403', r.status, 403);

  r = await del(`/universities/${uniId}`, { role: 'admin' });
  assert('DELETE /universities (admin) → 200', r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function testDepartments() {
  section('DEPARTMENTS');

  let r = await get('/departments');
  assert('GET /departments → 200',                   r.status, 200);

  r = await get('/departments?major=Computer Science');
  assert('GET ?major → filtered',                    r.data.data.every(d => d.majorName.toLowerCase().includes('computer science')), true);

  r = await get('/departments?universityId=1');
  assert('GET ?universityId → filtered',             r.data.data.every(d => d.universityId === 1), true);

  r = await get('/departments/999');
  assert('GET /departments/999 → 404',               r.status, 404);

  r = await post('/departments', { universityId: 1, majorName: 'Data Sci', degreeType: 'B.Sc', faculty: 'Sciences' }, { role: 'editor' });
  assert('POST /departments (editor) → 201',         r.status, 201);
  const deptId = r.data.data.departmentId;

  r = await post('/departments', { universityId: 1, majorName: 'X', degreeType: 'B.Sc', faculty: 'Y' }, { role: 'user' });
  assert('POST /departments (user) → 403',           r.status, 403);

  r = await put(`/departments/${deptId}`, { universityId: 1, majorName: 'Updated', degreeType: 'B.Sc', faculty: 'Sciences' }, { role: 'editor' });
  assert('PUT /departments (editor) → 200',          r.status, 200);

  r = await del(`/departments/${deptId}`, { role: 'editor' });
  assert('DELETE /departments (editor) → 403',       r.status, 403);

  r = await del(`/departments/${deptId}`, { role: 'admin' });
  assert('DELETE /departments (admin) → 200',        r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function testAdmissionThresholds() {
  section('ADMISSION THRESHOLDS');

  let r = await get('/admission-thresholds');
  assert('GET /admission-thresholds → 200',              r.status, 200);

  r = await get('/admission-thresholds?departmentId=1');
  assert('GET ?departmentId=1 → filtered',               r.data.data.every(t => t.departmentId === 1), true);

  // invalid sekemType
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2025, sekemType: 'bad',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 }, minSekem: 155
  }, { role: 'admin' });
  assert('POST (invalid sekemType) → 400',               r.status, 400);

  // weights don't sum to 1
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2025, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.5, psychometricWeight: 0.6 }, minSekem: 155
  }, { role: 'admin' });
  assert('POST (weights != 1) → 400',                    r.status, 400);

  // success
  r = await post('/admission-thresholds', {
    departmentId: 3, year: 2025, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 },
    sekemBonuses: [{ condition: '5-unit Math', points: 7 }],
    minSekem: 163
  }, { role: 'editor' });
  assert('POST /admission-thresholds (editor) → 201',    r.status, 201);
  const thresholdId = r.data.data.thresholdId;

  // user forbidden
  r = await post('/admission-thresholds', {
    departmentId: 1, year: 2026, sekemType: 'quantitative',
    sekemWeights: { bagrutWeight: 0.4, psychometricWeight: 0.6 }, minSekem: 100
  }, { role: 'user' });
  assert('POST /admission-thresholds (user) → 403',      r.status, 403);

  // editor cannot delete
  r = await del(`/admission-thresholds/${thresholdId}`, { role: 'editor' });
  assert('DELETE (editor) → 403',                        r.status, 403);

  r = await del(`/admission-thresholds/${thresholdId}`, { role: 'admin' });
  assert('DELETE (admin) → 200',                         r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function testAcademicScores() {
  section('ACADEMIC SCORES');

  // editor blocked from reading entirely
  let r = await get('/academic-scores', { role: 'editor' });
  assert('GET /academic-scores (editor) → 403',           r.status, 403);

  // admin allowed
  r = await get('/academic-scores', { role: 'admin' });
  assert('GET /academic-scores (admin) → 200',            r.status, 200);

  r = await get('/academic-scores?userId=5', { role: 'admin' });
  assert('GET ?userId=5 → filtered',                      r.data.data.every(s => s.userId === 5) && r.data.data.length > 0, true);

  // user sees ONLY their own scores (Dana = userId 5)
  r = await get('/academic-scores', { role: 'user', userId: 5 });
  assert('GET /academic-scores (user) → only own',        r.data.data.every(s => s.userId === 5), true);

  // user cannot read another user's scores entry by id (entry 2 belongs to Tal=6)
  r = await get('/academic-scores/2', { role: 'user', userId: 5 });
  assert('GET other user scores by id (user) → 403',      r.status, 403);

  // user CAN read their own scores entry by id (entry 1 belongs to Dana=5)
  r = await get('/academic-scores/1', { role: 'user', userId: 5 });
  assert('GET own scores by id (user) → 200',             r.status, 200);

  r = await get('/academic-scores/999', { role: 'admin' });
  assert('GET /academic-scores/999 → 404',                r.status, 404);

  // Create a fresh user for testing scores
  let createRes = await post('/users', { firstName: 'Score', lastName: 'Test', userRole: 'user', username: `Score${Date.now()}`, email: `score${Date.now()}@unipathway.com`, password: 'pass1234' }, { role: 'admin' });
  const tempUserId = createRes.data.data.userId;

  // POST - editor forbidden
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'editor' });
  assert('POST /academic-scores (editor) → 403',          r.status, 403);

  // user cannot create scores for SOMEONE ELSE (Dana=5 trying to create for tempUser)
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'user', userId: 5 });
  assert('POST /academic-scores (user for other) → 403',  r.status, 403);

  // POST - missing userId
  r = await post('/academic-scores', { psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST (missing userId) → 400',                   r.status, 400);

  // POST - cannot add scores for an admin user
  r = await post('/academic-scores', { userId: 1, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST (scores for admin user) → 400',            r.status, 400);

  // POST - invalid psychometric range
  r = await post('/academic-scores', {
    userId: tempUserId,
    psychometricScores: { verbal: 999, quantitative: 120, english: 110 },
    bagrutScores: sampleBagrut
  }, { role: 'admin' });
  assert('POST (bad psychometric) → 400',                 r.status, 400);

  // POST - missing mandatory bagrut subject
  const partialBagrut = { ...sampleBagrut };
  delete partialBagrut.civics;
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: partialBagrut }, { role: 'admin' });
  assert('POST (missing mandatory subject) → 400',        r.status, 400);

  // POST - success
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST /academic-scores → 201',                   r.status, 201);
  assert('POST → watchlistEntriesRecalculated is number', typeof r.data.data.watchlistEntriesRecalculated, 'number');
  const newScoresId = r.data.data.academicScoresId;

  // POST - cannot add a second scores entry for same user
  r = await post('/academic-scores', { userId: tempUserId, psychometricScores: samplePsychometric, bagrutScores: sampleBagrut }, { role: 'admin' });
  assert('POST (duplicate scores for user) → 400',        r.status, 400);

  // PUT - update scores
  r = await put(`/academic-scores/${newScoresId}`, {
    psychometricScores: { verbal: 130, quantitative: 140, english: 130 },
    bagrutScores: sampleBagrut
  }, { role: 'admin' });
  assert('PUT /academic-scores → 200',                    r.status, 200);
  assert('PUT → watchlistEntriesRecalculated is number',  typeof r.data.data.watchlistEntriesRecalculated, 'number');

  // DELETE - editor forbidden
  r = await del(`/academic-scores/${newScoresId}`, { role: 'editor' });
  assert('DELETE /academic-scores (editor) → 403',        r.status, 403);

  // DELETE - admin
  r = await del(`/academic-scores/${newScoresId}`, { role: 'admin' });
  assert('DELETE /academic-scores → 200',                 r.status, 200);

  // Cleanup the test user
  await del(`/users/${tempUserId}`, { role: 'admin' });
}

// ──────────────────────────────────────────────────────────────────────
async function testWatchlist() {
  section('USER WATCHLIST');

  // editor blocked from reading
  let r = await get('/watchlist', { role: 'editor' });
  assert('GET /watchlist (editor) → 403',                 r.status, 403);

  r = await get('/watchlist', { role: 'admin' });
  assert('GET /watchlist (admin) → 200',                  r.status, 200);

  // user sees ONLY their own watchlist (Dana = userId 5)
  r = await get('/watchlist', { role: 'user', userId: 5 });
  assert('GET /watchlist (user) → only own',              r.data.data.every(w => w.userId === 5), true);

  // user cannot read another user's watchlist entry by id (entry 4 belongs to Tal=6)
  r = await get('/watchlist/4', { role: 'user', userId: 5 });
  assert('GET other user watchlist by id (user) → 403',   r.status, 403);

  // user CAN read their own watchlist entry by id (entry 1 belongs to Dana=5)
  r = await get('/watchlist/1', { role: 'user', userId: 5 });
  assert('GET own watchlist by id (user) → 200',          r.status, 200);

  r = await get('/watchlist?userId=5', { role: 'admin' });
  assert('GET ?userId=5 (admin) → filtered',              r.data.data.every(w => w.userId === 5), true);

  r = await get('/watchlist?sekemStatus=passed-required-acceptance-score', { role: 'admin' });
  assert('GET ?sekemStatus=passed → filtered',            r.data.data.every(w => w.sekemStatus === 'passed-required-acceptance-score'), true);

  // user cannot create a watchlist entry for SOMEONE ELSE (Dana=5 creating for Tal=6)
  r = await post('/watchlist', { userId: 6, departmentId: 3 }, { role: 'user', userId: 5 });
  assert('POST /watchlist (user for other) → 403',        r.status, 403);

  // POST - invalid status values (Dana acting on her own behalf)
  r = await post('/watchlist', { userId: 5, departmentId: 8, status: 'Maybe' }, { role: 'user', userId: 5 });
  assert('POST (invalid status) → 400',                   r.status, 400);

  r = await post('/watchlist', { userId: 5, departmentId: 8, status: 'passed-required-acceptance-score' }, { role: 'user', userId: 5 });
  assert('POST (sekem status as status) → 400',           r.status, 400);

  // POST - cannot watchlist for an admin/editor user (admin performing the call)
  r = await post('/watchlist', { userId: 1, departmentId: 3 }, { role: 'admin' });
  assert('POST (watchlist for admin user) → 400',         r.status, 400);

  r = await post('/watchlist', { userId: 4, departmentId: 3 }, { role: 'admin' });
  assert('POST (watchlist for editor user) → 400',        r.status, 400);

  // POST - user/dept not found (admin can target any user, so these reach the validators)
  r = await post('/watchlist', { userId: 999, departmentId: 1 }, { role: 'admin' });
  assert('POST (user not found) → 404',                   r.status, 404);

  r = await post('/watchlist', { userId: 5, departmentId: 999 }, { role: 'user', userId: 5 });
  assert('POST (dept not found) → 404',                   r.status, 404);

  // POST - duplicate (Dana already watches dept 6)
  r = await post('/watchlist', { userId: 5, departmentId: 6 }, { role: 'user', userId: 5 });
  assert('POST (duplicate) → 400',                        r.status, 400);

  // POST - success with default status (Dana hasn't watched dept 8 yet)
  r = await post('/watchlist', { userId: 5, departmentId: 8 }, { role: 'user', userId: 5 });
  assert('POST /watchlist (default status) → 201',        r.status, 201);
  assert('POST → status defaults to Interested',          r.data.data.status, 'Interested');
  assert('POST → sekemStatus is server-calculated',
    ['passed-required-acceptance-score','below-required-acceptance-score','no-data'].includes(r.data.data.sekemStatus), true);
  const newEntryId = r.data.data.watchlistId;

  // PUT - update status (Dana editing her own entry)
  r = await put(`/watchlist/${newEntryId}`, { status: 'Applied' }, { role: 'user', userId: 5 });
  assert('PUT /watchlist/:id → 200',                      r.status, 200);

  r = await get(`/watchlist/${newEntryId}`, { role: 'admin' });
  assert('GET after PUT → status updated to Applied',     r.data.data.status, 'Applied');

  // PUT - a different user cannot edit Dana's entry (Tal=6 trying)
  r = await put(`/watchlist/${newEntryId}`, { status: 'Interested' }, { role: 'user', userId: 6 });
  assert('PUT other user watchlist (user) → 403',         r.status, 403);

  // PUT - sekem status as status rejected
  r = await put(`/watchlist/${newEntryId}`, { status: 'passed-required-acceptance-score' }, { role: 'user', userId: 5 });
  assert('PUT (sekem status as status) → 400',            r.status, 400);

  // DELETE - editor forbidden
  r = await del(`/watchlist/${newEntryId}`, { role: 'editor' });
  assert('DELETE /watchlist (editor) → 403',              r.status, 403);

  // DELETE - a different user cannot delete Dana's entry (Tal=6 trying)
  r = await del(`/watchlist/${newEntryId}`, { role: 'user', userId: 6 });
  assert('DELETE other user watchlist (user) → 403',      r.status, 403);

  // DELETE - Dana deletes her own entry
  r = await del(`/watchlist/${newEntryId}`, { role: 'user', userId: 5 });
  assert('DELETE /watchlist/:id → 200',                   r.status, 200);
}


// ──────────────────────────────────────────────────────────────────────
async function testAuth() {
  section('AUTHENTICATION / LOGIN');

  // Successful login
  let r = await post('/auth/login', { email: 'dana@unipathway.com', password: 'dana1234' });
  assert('POST /login (valid) → 200',                     r.status, 200);
  assert('POST /login → returns user',                    r.data.data.user.userId, 5);
  assert('POST /login → no passwordHash leaked',          r.data.data.user.passwordHash, undefined);
  assert('POST /login → no passwordSalt leaked',          r.data.data.user.passwordSalt, undefined);

  // Wrong password
  r = await post('/auth/login', { email: 'dana@unipathway.com', password: 'wrongpass' });
  assert('POST /login (wrong password) → 401',            r.status, 401);
  assert('POST /login (wrong password) → INVALID_CREDENTIALS', r.data.error.code, 'INVALID_CREDENTIALS');

  // Unknown email
  r = await post('/auth/login', { email: 'nobody@unipathway.com', password: 'whatever' });
  assert('POST /login (unknown email) → 401',             r.status, 401);

  // Missing fields
  r = await post('/auth/login', { email: 'dana@unipathway.com' });
  assert('POST /login (missing password) → 400',          r.status, 400);

  // Invalid email format
  r = await post('/auth/login', { email: 'not-an-email', password: 'dana1234' });
  assert('POST /login (bad email format) → 400',          r.status, 400);

  // Newly created user can log in
  const newEmail = `tester${Date.now()}@unipathway.com`;
  let createR = await post('/users', {
    firstName: 'Login', lastName: 'Tester', userRole: 'user',
    username: `lg${Date.now()}`, email: newEmail, password: 'secret123'
  }, { role: 'admin' });
  if (createR.status !== 201) {
    console.error('DEBUG createR:', JSON.stringify(createR.data, null, 2));
  }
  assert('Setup: create user for login test → 201',      createR.status, 201);
  const tempId = createR.data.data.userId;

  r = await post('/auth/login', { email: newEmail, password: 'secret123' });
  assert('Login with newly created user → 200',           r.status, 200);

  await del(`/users/${tempId}`, { role: 'admin' });

  // ─── GET /users/me ───
  r = await get('/users/me', { role: 'user', userId: 5 });
  assert('GET /users/me → 200',                           r.status, 200);
  assert('GET /users/me → correct user',                  r.data.data.userId, 5);
  assert('GET /users/me → has theme',                     typeof r.data.data.theme, 'string');
  assert('GET /users/me → no password leaked',            r.data.data.passwordHash, undefined);

  r = await get('/users/me');
  assert('GET /users/me (no x-user-id) → 401',            r.status, 401);

  // ─── POST /auth/logout ───
  r = await post('/auth/logout', {});
  assert('POST /auth/logout → 200',                       r.status, 200);
}

// ──────────────────────────────────────────────────────────────────────
async function testSettings() {
  section('SETTINGS');

  // GET settings for a user
  let r = await get('/settings', { role: 'user', userId: 5 });
  assert('GET /settings → 200',                           r.status, 200);
  assert('GET /settings → has username',                  typeof r.data.data.username, 'string');
  assert('GET /settings → correct userId',                r.data.data.userId, 5);
  assert('GET /settings → has email',                     typeof r.data.data.email, 'string');
  assert('GET /settings → has theme',                     typeof r.data.data.theme, 'string');
  assert('GET /settings → no password leaked',            r.data.data.passwordHash, undefined);

  // GET with a role but no x-user-id → controller returns 401
  r = await get('/settings', { role: 'user' });
  assert('GET /settings (no x-user-id) → 401',            r.status, 401);

  // PUT update username
  const newUsername = `dana_${Date.now()}`;
  r = await put('/settings', { username: newUsername }, { role: 'user', userId: 5 });
  assert('PUT /settings (username) → 200',                r.status, 200);
  assert('PUT /settings → username updated',              r.data.data.username, newUsername);

  // PUT duplicate username
  r = await put('/settings', { username: 'tals' }, { role: 'user', userId: 5 });
  assert('PUT /settings (duplicate username) → 400',      r.status, 400);

  // PUT invalid username format
  r = await put('/settings', { username: 'a' }, { role: 'user', userId: 5 });
  assert('PUT /settings (invalid username) → 400',        r.status, 400);

  // PUT update email + password
  const newEmail2 = `danaupdated${Date.now()}@unipathway.com`;
  r = await put('/settings', { email: newEmail2, password: 'newpass123' }, { role: 'user', userId: 5 });
  assert('PUT /settings (email+password) → 200',          r.status, 200);
  assert('PUT /settings → email updated',                 r.data.data.email, newEmail2);
  assert('PUT /settings → no password leaked',            r.data.data.passwordHash, undefined);

  // Login with the new password to confirm the hash was actually updated
  r = await post('/auth/login', { email: newEmail2, password: 'newpass123' });
  assert('Login with new password after settings update → 200', r.status, 200);

  // PUT duplicate email
  r = await put('/settings', { email: 'tal@unipathway.com' }, { role: 'user', userId: 5 });
  assert('PUT /settings (duplicate email) → 400',         r.status, 400);

  // PUT invalid email format
  r = await put('/settings', { email: 'not-an-email' }, { role: 'user', userId: 5 });
  assert('PUT /settings (invalid email format) → 400',    r.status, 400);

  // PUT update theme
  r = await put('/settings', { theme: 'dark' }, { role: 'user', userId: 5 });
  assert('PUT /settings (theme) → 200',                   r.status, 200);
  assert('PUT /settings → theme updated',                 r.data.data.theme, 'dark');

  // PUT invalid theme value
  r = await put('/settings', { theme: 'rainbow' }, { role: 'user', userId: 5 });
  assert('PUT /settings (invalid theme) → 400',           r.status, 400);

  // PUT invalid password length
  r = await put('/settings', { password: '123' }, { role: 'user', userId: 5 });
  assert('PUT /settings (short password) → 400',          r.status, 400);

  // Restore Dana's original credentials and theme for any later tests
  await put('/settings', { username: 'danac', email: 'dana@unipathway.com', password: 'dana1234', theme: 'dark' }, { role: 'user', userId: 5 });

  // ─── Editor can manage their OWN settings (Yael = userId 3) ───
  r = await get('/settings', { role: 'editor', userId: 3 });
  assert('GET /settings (editor own) → 200',              r.status, 200);
  assert('GET /settings (editor) → correct userId',       r.data.data.userId, 3);

  r = await put('/settings', { theme: 'light' }, { role: 'editor', userId: 3 });
  assert('PUT /settings (editor own) → 200',              r.status, 200);

  // ─── Admin can view/edit ANY user's settings via /:id ───
  r = await get('/settings/5', { role: 'admin' });
  assert('GET /settings/:id (admin) → 200',               r.status, 200);
  assert('GET /settings/:id (admin) → correct user',      r.data.data.userId, 5);
  assert('GET /settings/:id (admin) → no password leaked', r.data.data.passwordHash, undefined);

  r = await put('/settings/5', { theme: 'light' }, { role: 'admin' });
  assert('PUT /settings/:id (admin) → 200',               r.status, 200);
  assert('PUT /settings/:id (admin) → theme updated',     r.data.data.theme, 'light');
  // restore
  await put('/settings/5', { theme: 'dark' }, { role: 'admin' });

  // GET /settings/:id for a non-existent user → 404
  r = await get('/settings/999', { role: 'admin' });
  assert('GET /settings/999 (admin) → 404',               r.status, 404);

  // ─── Non-admins cannot use the /:id route ───
  r = await get('/settings/6', { role: 'user', userId: 5 });
  assert('GET /settings/:id (user) → 403',                r.status, 403);

  r = await put('/settings/6', { theme: 'light' }, { role: 'user', userId: 5 });
  assert('PUT /settings/:id (user) → 403',                r.status, 403);

  r = await get('/settings/6', { role: 'editor', userId: 3 });
  assert('GET /settings/:id (editor) → 403',              r.status, 403);

  // PUT with a role but no x-user-id → controller returns 401
  r = await put('/settings', { username: 'shouldfail' }, { role: 'user' });
  assert('PUT /settings (no x-user-id) → 401',            r.status, 401);
}

// ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('🚀 UniPathway API - Automated Tests');
  console.log(`   Target: ${BASE_URL}\n`);

  try {
    await testAuth();
    await testRegister();
    await testUsers();
    await testUniversities();
    await testDepartments();
    await testAdmissionThresholds();
    await testAcademicScores();
    await testWatchlist();
    await testSettings();
  } catch (err) {
    console.error('\n💥 Unexpected error during tests:', err.message);
    console.error(err.stack);
    console.error('   Is the server running on port 3000?\n');
    process.exitCode = 1;
    return;
  }

  console.log(results.join('\n'));
  console.log('\n' + '─'.repeat(40));
  console.log(`Total:  ${passed + failed} tests`);
  console.log(`✅ Passed: ${passed}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  else            console.log('🎉 All tests passed!');
  console.log('─'.repeat(40));

  // Use exitCode instead of process.exit() so Node can clean up pending
  // async handles (sockets, timers) naturally before the process ends.
  // process.exit() can race with libuv handle cleanup on Windows and crash.
  process.exitCode = failed > 0 ? 1 : 0;
}

run();