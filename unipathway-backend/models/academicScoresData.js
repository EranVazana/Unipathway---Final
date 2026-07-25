// Default blank scores template — used for admin/editor users and seeded on registration.
// Grade 0 with minimum required units for each mandatory subject;
// psychometric at the minimum valid value (50). Users fill in their real data.
const DEFAULT_BAGRUT = {
  bibleStudies:     { grade: 0, units: 2 },
  literature:       { grade: 0, units: 2 },
  hebrewExpression: { grade: 0, units: 2 },
  history:          { grade: 0, units: 2 },
  civics:           { grade: 0, units: 2 },
  mathematics:      { grade: 0, units: 3 },
  english:          { grade: 0, units: 3 }
};

function defaultBagrut() { return JSON.parse(JSON.stringify(DEFAULT_BAGRUT)); }
function defaultPsychometric() { return { verbal: 50, quantitative: 50, english: 50 }; }

const academicScores = [
  // ── Admins ──────────────────────────────────────────────────────────────
  {
    academicScoresId: 1,
    userId: 1, // Eran Vazana (admin)
    psychometricScores: defaultPsychometric(),
    bagrutScores: defaultBagrut(),
    createDate: '2024-01-10T10:00:00.000Z',
    updateDate: '2024-01-10T10:00:00.000Z'
  },
  {
    academicScoresId: 2,
    userId: 2, // Omri Hershkovich (admin)
    psychometricScores: defaultPsychometric(),
    bagrutScores: defaultBagrut(),
    createDate: '2024-01-11T09:30:00.000Z',
    updateDate: '2024-01-11T09:30:00.000Z'
  },

  // ── Editors ─────────────────────────────────────────────────────────────
  {
    academicScoresId: 3,
    userId: 3, // Yael Levi (editor)
    psychometricScores: defaultPsychometric(),
    bagrutScores: defaultBagrut(),
    createDate: '2024-02-01T08:00:00.000Z',
    updateDate: '2024-02-01T08:00:00.000Z'
  },
  {
    academicScoresId: 4,
    userId: 4, // Roni Bar (editor)
    psychometricScores: defaultPsychometric(),
    bagrutScores: defaultBagrut(),
    createDate: '2024-02-15T11:00:00.000Z',
    updateDate: '2024-02-15T11:00:00.000Z'
  },

  // ── Regular users ────────────────────────────────────────────────────────
  {
    academicScoresId: 5,
    userId: 5, // Dana Cohen (verbal profile)
    psychometricScores: {
      verbal: 142,
      quantitative: 118,
      english: 136
    },
    bagrutScores: {
      bibleStudies:     { grade: 92, units: 2 },
      literature:       { grade: 95, units: 3 },
      hebrewExpression: { grade: 90, units: 2 },
      history:          { grade: 88, units: 3 },
      civics:           { grade: 91, units: 2 },
      mathematics:      { grade: 74, units: 3 },
      english:          { grade: 93, units: 5 },
      psychology:       { grade: 96, units: 5 },
      arabic:           { grade: 85, units: 3 }
    },
    createDate: '2024-03-05T14:20:00.000Z',
    updateDate: '2024-03-05T14:20:00.000Z'
  },
  {
    academicScoresId: 6,
    userId: 6, // Tal Shapira (quantitative profile)
    psychometricScores: {
      verbal: 120,
      quantitative: 148,
      english: 132
    },
    bagrutScores: {
      bibleStudies:     { grade: 80, units: 2 },
      literature:       { grade: 78, units: 2 },
      hebrewExpression: { grade: 84, units: 2 },
      history:          { grade: 79, units: 2 },
      civics:           { grade: 81, units: 2 },
      mathematics:      { grade: 95, units: 5 },
      english:          { grade: 88, units: 5 },
      computerScience:  { grade: 94, units: 5 },
      physics:          { grade: 90, units: 5 }
    },
    createDate: '2024-03-10T16:45:00.000Z',
    updateDate: '2024-03-10T16:45:00.000Z'
  }
];

let nextId = 7;
function getNextId() { return nextId++; }

module.exports = { academicScores, getNextId };