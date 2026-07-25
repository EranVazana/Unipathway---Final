# UniPathway — Backend (Assignment 4)

UniPathway is a smart academic consultant platform that helps Israeli students make confident university decisions by comparing their **Sekem** scores against real admission thresholds.

Assignment 4 upgrades the backend into a complete full-stack server with:

- **MySQL persistence** through a hand-rolled Active-Record ORM layer (`models/*.js` over `mysql2`)
- **Real-time notifications** via Socket.IO
- **AI Advisor** powered by Google Gemini

Built for the Web Development Environments course at Ben-Gurion University of the Negev.

**Team:** Eran Vazana & Omri Hershkovich

---

## Prerequisites

- Node.js v16+
- MySQL 8.x running locally
- A Google Gemini API key (free at https://aistudio.google.com/apikey)

---

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | API server port | `3000` |
| `DB_HOST` / `DB_PORT` | MySQL host and port | `127.0.0.1` / `3306` |
| `DB_NAME` | Database name | `unipathway` |
| `DB_USER` / `DB_PASSWORD` | MySQL credentials | `root` / — |
| `GEMINI_API_KEY` | Google Gemini API key (server-side only, never sent to the frontend) | — |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `AI_SYSTEM_PROMPT` | System prompt for the AI Advisor | see `.env.example` |
| `AI_WELCOME_MESSAGE` | First message shown in the chat | see `.env.example` |

## Database Setup

1. Create the database (schema file also in `migrations/schema.sql`):

```sql
CREATE DATABASE unipathway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Start the server — on first run it creates/uses the tables and **seeds** demo users, universities, departments, thresholds, watchlists, and academic scores automatically. Seeding is skipped if data already exists.

```bash
npm start
```

All data persists in MySQL across server restarts.

## Project Structure

```
unipathway-backend/
├── src/                  # Node.js + Express source code
│   ├── index.js          # Entry point (Express + Socket.IO bootstrap)
│   ├── socket.js         # Socket.IO server + notification broadcast
│   ├── controllers/      # Route handlers
│   ├── routes/           # Express routers (mounted under /api)
│   ├── middleware/       # Auth, validation, logging
│   ├── utils/            # Password hashing, Sekem calculator
│   └── database/         # Connection pool + seeder
├── models/               # ORM models (Active Record over mysql2)
├── migrations/           # schema.sql — database schema
└── docs/                 # Postman collection & screenshots
```

Run with `npm start` (executes `node src/index.js`).

## ORM Layer

`models/` contains one Active-Record class per table (`User`, `Admin`, `Settings`, `University`, `Department`, `AdmissionThreshold`, `UserWatchlist`, `AcademicScores`, `Notification`, `UserNotificationStatus`), built on `mysql2/promise` with parameterized queries.

**Relationships implemented:**

| Relationship | Tables | Type |
|--------------|--------|------|
| University → Departments | `Universities` 1—N `Departments` | one-to-many |
| Department → Thresholds | `Departments` 1—N `AdmissionThresholds` | one-to-many |
| User ↔ Departments | `UserWatchlist` junction table | many-to-many |
| User → AcademicScores | 1—1 | one-to-one |
| User ↔ Notifications | `UserNotificationStatus` junction table | many-to-many |

Relational (JOIN) queries include `User.findAllWithSettings()`, watchlist entries joined with departments/universities, and per-user notification status.

## API Endpoints

All endpoints are prefixed with `/api` and follow the standard response envelope (`{ success, data, error }`). Authentication uses `x-user-role` / `x-user-id` headers.

| Resource | Endpoints |
|----------|-----------|
| Auth | `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout` |
| Users | `GET /api/users`, `GET /api/users/me`, `GET /api/users/admins`, `GET/PUT/DELETE /api/users/:id`, `POST /api/users` |
| Settings | `GET /api/settings`, `PUT /api/settings`, `GET/PUT /api/settings/:id` |
| Universities | full CRUD at `/api/universities` |
| Departments | full CRUD at `/api/departments` |
| Admission Thresholds | full CRUD at `/api/admission-thresholds` |
| Academic Scores | full CRUD at `/api/academic-scores` |
| Watchlist | full CRUD at `/api/watchlist` |
| Notifications | `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`, `DELETE /api/notifications/:id`, `DELETE /api/notifications/clear-all` |
| AI | `GET /api/ai/welcome`, `POST /api/ai/chat` |

Full request examples: `docs/Postman/UniPathway.postman_collection.json`.

## WebSocket Feature — Live Notifications

Socket.IO server runs on the same port as the API (`ws://localhost:3000`).

When an admin/editor creates a new **university** or **department**, every other connected client instantly receives a notification (bell icon in the navbar). Notifications are persisted in MySQL, so they survive refreshes and restarts, with per-user read/unread state.

**Custom events (beyond connect/disconnect):**

| Event | Direction | Purpose |
|-------|-----------|---------|
| `presence:join` | client → server | Client identifies itself (userId + role) after connecting |
| `notification:new` | server → clients | Broadcast of a newly created notification (skips the triggering user) |
| `notification:read` | client → server | Mark one notification as read (acked with `notification:read_ack`) |
| `notification:read_all` | client → server | Mark all as read (acked with `notification:read_all_ack`) |
| `notification:clear` | client → server | Clear the client's list (acked with `notification:clear_ack`) |

To demo: open the app in two browsers (or one normal + one incognito), log in as two different users, create a university as an admin in one — the bell updates live in the other.

## AI Feature — UniPathway AI Advisor

`POST /api/ai/chat` proxies to **Google Gemini** — the API key lives only in the backend `.env` and is never exposed to the frontend.

On every request the backend builds a domain context: all universities, departments, and latest admission thresholds, plus the logged-in user's psychometric/Bagrut scores and their **calculated Sekem per department** (✅ qualifies / ❌ below threshold). The advisor answers questions like *"Which CS programs do I qualify for?"* grounded in real system data, in Hebrew or English.

## Testing

```bash
npm test        # runs test.js against a running server (start it first)
```

## Known Limitations

- Auth uses `x-user-id`/`x-user-role` headers rather than signed tokens (per course scope) — the server trusts the client's claimed identity.
- The AI advisor requires a valid `GEMINI_API_KEY`; without it, chat returns an error (the rest of the app works normally).
- Seeding runs only on an empty database; to re-seed, drop the database and restart.
- Notifications are broadcast for university/department creation events only.

---

*Last updated: 24.7.26*
