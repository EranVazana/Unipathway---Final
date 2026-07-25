require('dotenv').config();
const http     = require('http');
const express  = require('express');
const cors     = require('cors');
const db       = require('./database/connection');
const seed     = require('./database/seeder');
const logger   = require('./middleware/logger');
const socket   = require('./socket');

const authRouter                = require('./routes/authRoute');
const usersRouter               = require('./routes/usersRoute');
const departmentsRouter         = require('./routes/departmentsRoute');
const universitiesRouter        = require('./routes/universitiesRoute');
const admissionThresholdsRouter = require('./routes/admissionThresholdsRoute');
const userWatchlistRouter       = require('./routes/userWatchlistRoute');
const academicScoresRouter      = require('./routes/academicScoresRoute');
const settingsRouter            = require('./routes/settingsRoute');
const notificationsRouter       = require('./routes/notificationsRoute');
const aiRouter                  = require('./routes/aiRoute');

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

console.clear();
app.use(express.json());
app.use(cors());
app.use(logger);

app.use('/api/auth',                 authRouter);
app.use('/api/users',                usersRouter);
app.use('/api/departments',          departmentsRouter);
app.use('/api/universities',         universitiesRouter);
app.use('/api/admission-thresholds', admissionThresholdsRouter);
app.use('/api/watchlist',            userWatchlistRouter);
app.use('/api/academic-scores',      academicScoresRouter);
app.use('/api/settings',             settingsRouter);
app.use('/api/notifications',        notificationsRouter);
app.use('/api/ai',                   aiRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found.`, details: {} } });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', details: {} } });
});

async function start() {
  // Step 1: connect to DB
  try {
    await db.execute('SELECT 1');
    console.log('✅ Database connection established.');
  } catch (err) {
    console.error('❌ Could not connect to MySQL.');
    console.error(`   Host : ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}`);
    console.error(`   DB   : ${process.env.DB_NAME || 'unipathway'}`);
    console.error(`   User : ${process.env.DB_USER || 'root'}`);
    if (err.code === 'ECONNREFUSED') {
      console.error('   → MySQL is not running. Start it via services.msc or: net start MySQL80');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Wrong username or password. Check DB_USER and DB_PASSWORD in your .env');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.error(`   → Database "${process.env.DB_NAME || 'unipathway'}" does not exist.`);
      console.error(`     Fix: run this in MySQL: CREATE DATABASE ${process.env.DB_NAME || 'unipathway'};`);
    } else {
      console.error(`   → ${err.message}`);
    }
    process.exit(1);
  }

  // Step 2: seed
  try {
    console.log('Seeding...');
    await seed();
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }

  // Step 3: init Socket.IO and listen
  socket.init(server);
  server.listen(PORT, () => {
    console.log(`🚀 UniPathway API running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server ready on ws://localhost:${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY is not set in .env — AI chat will not work.');
    } else {
      console.log('🤖 Gemini AI configured.');
    }
  });
}

start();