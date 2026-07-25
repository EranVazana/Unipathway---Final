# UniPathway 🎓

**A smart academic consultant platform for Israeli students** - compare your Sekem score against real university admission thresholds, track the departments you care about, and get personalized AI-powered admissions advice.

Final project for the Web Development Environments course, Ben-Gurion University of the Negev (Assignment 4 - Full Stack Application).

**Team:** Eran Vazana & Omri Hershkovich

---

## What It Does

Israeli university admission is decided by the **Sekem** - a weighted combination of psychometric and Bagrut scores, where every department weighs the components differently. UniPathway calculates your Sekem per department, tells you where you qualify, and helps you plan:

- **Browse** universities and departments with real admission thresholds per year
- **Compare** programs side by side against your own calculated Sekem
- **Track** a personal watchlist with application status and live pass/fail indication
- **Get advised** by an AI assistant (Google Gemini) that knows every program in the system *and* your scores
- **Stay updated** with real-time notifications when new universities or departments are added

## Architecture

```
React Frontend  (port 5173)
      │  fetch / Socket.IO client
      ▼
Express Backend (port 3000, /api prefix)
      │  Active-Record ORM layer (mysql2)
      ▼
MySQL Database  (persistent storage)
      +
Socket.IO       (live notifications)
      +
Google Gemini   (AI Advisor - key stays server-side)
```

## Repository Structure

```
.
├── backend/          # Node.js + Express + MySQL + Socket.IO + Gemini
│   ├── src/          # Server source (controllers, routes, middleware, database)
│   ├── models/       # ORM models (User, Admin, University, Department, ...)
│   ├── migrations/   # schema.sql
│   └── docs/         # Postman collection
├── frontend/         # React (CRA) + React Router + socket.io-client
│   └── src/          # Components, pages, services, context, hooks
└── screenshots/      # Required submission screenshots
```

Each part has its own README with full details: **[backend/README.md](backend/README.md)** · **[frontend/README.md](frontend/README.md)**

## Quick Start

**Prerequisites:** Node.js v16+, MySQL 8.x, a free [Gemini API key](https://aistudio.google.com/apikey)

```bash
# 1. Database
mysql -u root -p -e "CREATE DATABASE unipathway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Backend (terminal 1)
cd backend
cp .env.example .env        # fill in DB_PASSWORD and GEMINI_API_KEY
npm install
npm start                   # runs on http://localhost:3000, seeds demo data on first run

# 3. Frontend (terminal 2)
cd frontend
npm install
npm start                   # opens http://localhost:5173
```

**Demo login:** `eran@unipathway.com` / see seeded credentials in `backend/models/settingsData.js` - or just sign up from the login page.

## Assignment 4 Requirements Map

| Requirement | Where |
|-------------|-------|
| MySQL + ORM, full CRUD | `backend/models/` - Active-Record classes over `mysql2`, used by all controllers |
| One-to-many relationship | Universities → Departments, Departments → AdmissionThresholds |
| Many-to-many relationship | Users ↔ Departments via `UserWatchlist`; Users ↔ Notifications via `UserNotificationStatus` |
| Relational (JOIN) queries | `User.findAllWithSettings`, `UserWatchlist.getDepartment`, `Notification.findAllForUser` |
| Persistence after restart | All state in MySQL; seeder skips non-empty DB |
| Socket.IO + 3 custom events | 5 custom events (`presence:join`, `notification:new`, `notification:read`, `notification:read_all`, `notification:clear`) - see `backend/src/socket.js` |
| Two-client real time | Create a university in one browser → notification bell updates in the other |
| AI endpoint via backend | `POST /api/ai/chat` → Gemini; key only in backend `.env` |
| Response envelope | Every endpoint returns `{ success, data, error }` |
| Postman collection | `backend/docs/Postman/UniPathway.postman_collection.json` (80 requests) |

## Configuration Files

### Environment Variables - `backend/.env.example`

A template `.env.example` lives in the **backend root** (`backend/.env.example`). Copy it to `backend/.env` and fill in your own values - the real `.env` is git-ignored and must never be committed.

```
# Server
PORT=3000

# MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=unipathway
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# Gemini AI (key stays server-side, never sent to the frontend)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
AI_SYSTEM_PROMPT=You are UniPathway AI Advisor...
AI_WELCOME_MESSAGE=Hi! I'm your UniPathway AI Advisor...
```

| Variable | Purpose |
|----------|---------|
| `PORT` | Backend API + WebSocket port (default 3000) |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | MySQL connection target |
| `DB_USER` / `DB_PASSWORD` | MySQL credentials |
| `GEMINI_API_KEY` | Google Gemini key - server-side only |
| `GEMINI_MODEL` | Gemini model name (default `gemini-2.5-flash`) |
| `AI_SYSTEM_PROMPT` / `AI_WELCOME_MESSAGE` | AI Advisor prompt and greeting |

### Postman Collection - `backend/docs/Postman/`

The full API collection is at **`backend/docs/Postman/UniPathway.postman_collection.json`** (80 requests across 10 folders: Auth, Users, Settings, Universities, Departments, Admission Thresholds, Academic Scores, Watchlist, Notifications, AI Advisor). Import it into Postman and set the `baseUrl` variable to `http://localhost:3000` to exercise every endpoint. Response screenshots are in `backend/docs/Postman/ScreenShots/`.

## Testing

```bash
cd backend
npm start        # in one terminal
npm test         # in another - full API test suite against the running server
```