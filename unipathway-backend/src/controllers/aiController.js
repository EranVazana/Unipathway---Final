const University         = require('../../models/University');
const Department         = require('../../models/Department');
const AdmissionThreshold = require('../../models/AdmissionThreshold');
const AcademicScores     = require('../../models/AcademicScores');
const UserWatchlist      = require('../../models/UserWatchlist');
const { calculateUserSekem } = require('../utils/sekemCalculator');

const success = (data) => ({ success: true, data, error: null });
const failure = (code, message, details = {}) => ({ success: false, data: null, error: { code, message, details } });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
const SYSTEM_PROMPT  = process.env.AI_SYSTEM_PROMPT || 'You are UniPathway AI Advisor, an expert assistant helping Israeli students navigate university admissions.';

async function buildContext(userId) {
  const [universities, departments, thresholds] = await Promise.all([
    University.findAll(),
    Department.findAll(),
    AdmissionThreshold.findAll(),
  ]);

  const thresholdsByDept = {};
  for (const t of thresholds) {
    if (!thresholdsByDept[t.departmentId]) thresholdsByDept[t.departmentId] = [];
    thresholdsByDept[t.departmentId].push(t);
  }

  const uniLines = universities.map(u =>
    `- ${u.name} (${u.type}), location: ${u.location}`
  );

  // Fetch user scores first so we can calculate sekem per department
  let scores = null;
  let watchlist = [];
  if (userId) {
    [scores, watchlist] = await Promise.all([
      AcademicScores.findByUserId(userId),
      UserWatchlist.findByUser(userId),
    ]);
  }

  const deptLines = departments.map(d => {
    const uni    = universities.find(u => u.universityId === d.universityId);
    const latest = (thresholdsByDept[d.departmentId] || []).sort((a, b) => b.year - a.year)[0];

    let thresholdStr = 'no threshold data';
    let userSekemStr = '';

    if (latest) {
      thresholdStr = `min Sekem: ${latest.minSekem}, type: ${latest.sekemType}, year: ${latest.year}`;

      // Calculate this user's sekem for this department if scores exist
      if (scores?.psychometricScores && scores?.bagrutScores) {
        const userSekem = calculateUserSekem(scores, latest);
        if (userSekem !== null) {
          const qualifies = userSekem >= latest.minSekem;
          userSekemStr = `, user's sekem: ${userSekem} (${qualifies ? '✅ qualifies' : '❌ below threshold by ' + (latest.minSekem - userSekem).toFixed(2) + ' pts'})`;
        }
      }
    }

    return `- ${d.majorName} (${d.degreeType}) at ${uni?.name || 'Unknown'}, faculty: ${d.faculty}, ${thresholdStr}${userSekemStr}`;
  });

  // User personal context
  let userContext = '';
  if (userId) {
    if (scores) {
      const psych = scores.psychometricScores;
      const bagrut = scores.bagrutScores;
      const psychStr = psych
        ? `verbal: ${psych.verbal ?? 'N/A'}, quantitative: ${psych.quantitative ?? 'N/A'}, english: ${psych.english ?? 'N/A'}`
        : 'not set';
      const bagrutStr = bagrut
        ? Object.entries(bagrut).map(([subj, val]) =>
            typeof val === 'object'
              ? `${subj}: grade ${val.grade}, ${val.units} units`
              : `${subj}: ${val}`
          ).join(', ')
        : 'not set';
      userContext += `\n\nUSER'S ACADEMIC SCORES:\n- Psychometric: ${psychStr}\n- Bagrut: ${bagrutStr}`;
    } else {
      userContext += `\n\nUSER'S ACADEMIC SCORES: not entered yet`;
    }

    if (watchlist.length > 0) {
      const watchlistLines = watchlist.map(w => {
        const dept = departments.find(d => d.departmentId === w.departmentId);
        const uni  = dept ? universities.find(u => u.universityId === dept.universityId) : null;
        return `- ${dept?.majorName ?? 'Unknown'} at ${uni?.name ?? 'Unknown'} (status: ${w.status}, your sekem: ${w.userSekem ?? 'N/A'})`;
      });
      userContext += `\n\nUSER'S WATCHLIST:\n${watchlistLines.join('\n')}`;
    } else {
      userContext += `\n\nUSER'S WATCHLIST: empty`;
    }
  }

  return `
UNIVERSITIES IN THE SYSTEM:
${uniLines.join('\n')}

DEPARTMENTS AND ADMISSION THRESHOLDS (with user's calculated sekem where available):
${deptLines.join('\n')}
${userContext}
`.trim();
}

async function getWelcome(req, res) {
  res.status(200).json(success({
    message: process.env.AI_WELCOME_MESSAGE || '👋 Hi! I\'m your UniPathway AI Advisor. Ask me anything about university admissions!'
  }));
}

async function chat(req, res) {
  try {
    const { message, history = [] } = req.body;
    if (!message?.trim()) {
      return res.status(400).json(failure('VALIDATION_ERROR', 'Message is required.', {}));
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json(failure('CONFIG_ERROR', 'AI service is not configured.', {}));
    }

    // Only pass userId for 'user' role — admins/editors don't have personal scores
    const role   = req.headers['x-user-role'];
    const userId = role === 'user' ? parseInt(req.headers['x-user-id']) || null : null;

    const dbContext = await buildContext(userId);

    const systemPrompt = `${SYSTEM_PROMPT}

You have access to the following real-time data from the UniPathway database:

${dbContext}

HOW TO HELP:
- Sekem is a weighted score combining psychometric test results and bagrut (matriculation) grades
- Quantitative Sekem weights math/science subjects more heavily
- Verbal Sekem weights language and humanities subjects more heavily
- General Sekem is a balanced combination
- The user's sekem is already calculated per department — use those values directly
- Be specific — reference actual department names, universities, and thresholds from the data above
- If the user asks which departments they qualify for, list them based on the calculated sekems
- Keep responses concise and helpful
- Respond in the same language the user writes in (Hebrew or English)`;

    const contents = [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood! I am ready to help.' }] },
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      { role: 'user',  parts: [{ text: message }] },
    ];

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      console.error('[AI] Gemini error:', err);
      return res.status(502).json(failure('AI_ERROR', 'Failed to get response from AI service.', {}));
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(502).json(failure('AI_ERROR', 'Empty response from AI service.', {}));
    }

    res.status(200).json(success({ reply }));
  } catch (err) {
    console.error('[AI] chat error:', err.message);
    res.status(500).json(failure('INTERNAL_ERROR', err.message));
  }
}

module.exports = { chat, getWelcome };