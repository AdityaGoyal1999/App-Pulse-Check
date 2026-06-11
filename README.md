# App Pulse Check 

**The heartbeat monitor for background jobs, cron tasks, and scripts.**

App Pulse Check is a lightweight uptime monitor for heartbeat-style jobs. Each monitored job gets a unique ping URL. When the job runs successfully, it calls that URL to signal it's alive. If pings stop arriving within the expected window, the check is marked down so you know something failed silently.

Built for indie hackers, solo developers, and small teams who need to know when scheduled or background work stops running — without standing up a full observability stack.

## ✨ Features

### ✅ Available now

- 📡 **Ping endpoint** — `GET /ping/:uuid` logs each ping and marks the check as `UP`
- 💚 **Health check** — `GET /health` for basic server monitoring
- 🗄️ **Data model** — `User`, `Check`, and `PingLog` tables with check status (`NEW`, `UP`, `DOWN`)
- ⚡ **Local dev workflow** — one command starts Postgres, Prisma Studio, and the API server
- 🔐 **User authentication** — signup, login, and logout with JWT Bearer tokens (API + UI)
- 📋 **Check management API** — create, list, and delete checks (user-scoped, JWT protected)
- 🌐 **Landing page** — product positioning with login and signup entry points
- 📊 **Dashboard** — protected `/dashboard` with check list, status badges (`NEW` / `UP` / `DOWN`), relative last-ping times, copy-ping-URL, create, and delete
- ⏱️ **Missed-ping detection** — standalone evaluation worker runs every 60s and marks overdue checks `DOWN` (respects `intervalSeconds` + `graceSeconds`, skips paused checks)

### 🔜 Planned

- 🔔 **Alerting** — Discord, Slack, or email notifications when checks go down
- ✅ **Resolution handling** — alert deduplication and recovery workflows when pings resume
- 🚀 **Production deployment** — hosted offering and self-host guides

## 🔄 How it works

1. ➕ Sign up and create a check with an expected interval and grace period.
2. 🔗 Copy the ping URL and add a one-line HTTP call to your cron job, script, or background worker.
3. 👀 The dashboard shows live status; the evaluation worker flags checks `DOWN` when pings stop arriving on time.

## 🛠 Tech stack


| Layer       | Stack                                               |
| ----------- | --------------------------------------------------- |
| ⚙️ API      | Node.js, TypeScript, Express                        |
| 🐘 Database | PostgreSQL, Prisma                                  |
| 🔑 Auth     | bcrypt, JSON Web Tokens, Zod validation             |
| 🎨 Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| ⚙️ Worker   | Standalone Node process (`backend/src/worker/`)     |


## 🚀 Getting started

### Prerequisites

- 🟢 Node.js
- 🐳 Docker (for local Postgres)

### ⚙️ Backend

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL, PORT
cp .env.example .env.local    # add JWT_SECRET (openssl rand -base64 32)
npm install
npm run dev:backend           # or from repo root: npm run dev:backend
```

The API runs at `http://localhost:3000`. Prisma Studio opens at `http://localhost:5555`.

### 🎨 Frontend

```bash
cd frontend
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' > .env.local
npm install
npm run dev                   # or from repo root: npm run dev:frontend
```

The app runs at `http://localhost:3001`. Sign up, then open `/dashboard` to manage checks.

### ⏱️ Evaluation worker

Run in a separate terminal while developing (uses the same `DATABASE_URL` as the API):

```bash
cd backend
npx tsx src/worker/index.ts
```

The worker evaluates all non-paused checks every 60 seconds. A check is marked `DOWN` when `now > lastPingedAt + intervalSeconds + graceSeconds`.

## 📁 Project structure

```
AppPulseCheck/
├── backend/
│   ├── prisma/           # schema, migrations, seed
│   ├── src/
│   │   ├── routes/       # ping, auth, checks
│   │   ├── worker/       # missed-ping evaluation loop
│   │   └── ...
│   └── scripts/dev.sh    # Docker Postgres + Studio + API
├── frontend/
│   └── src/
│       ├── app/          # landing, login, signup, dashboard
│       └── components/   # CheckList, StatusBadge, auth UI, etc.
└── package.json          # root scripts: dev:backend, dev:frontend, stop
```

## 🗺️ Roadmap


| Milestone                    | Status         |
| ---------------------------- | -------------- |
| Core API and ping ingestion  | ✅ Shipped      |
| User auth and check CRUD     | ✅ Shipped      |
| Web dashboard                | ✅ Shipped      |
| Background status worker     | ✅ Shipped      |
| Alerting and notifications   | 🔜 Planned     |
| Resolution and deduplication | 🔜 Planned     |
| Production deployment        | 🔜 Planned     |

