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
- 🌐 **Landing page** — product positioning and onboarding entry point
- 🔐 **User authentication** — signup, login, and logout with JWT Bearer tokens
- 📋 **Check management API** — create, list, and delete checks (user-scoped, JWT protected)

### 🔜 Planned

- 📊 **Dashboard** — view check status and history in the browser
- ⏱️ **Missed-ping detection** — background worker marks checks `DOWN` when pings stop
- 🔔 **Alerting** — notifications when checks go down
- ✅ **Resolution handling** — alert deduplication and recovery workflows
- 🚀 **Production deployment** — hosted offering and self-host guides

## 🔄 How it works

1. ➕ Create a check and get a unique ping URL.
2. 🔗 Add a one-line HTTP call to your cron job, script, or background worker.
3. 👀 App Pulse Check tracks incoming pings and flags the check when they stop.

## 🛠 Tech stack


| Layer       | Stack                                               |
| ----------- | --------------------------------------------------- |
| ⚙️ API      | Node.js, TypeScript, Express                        |
| 🐘 Database | PostgreSQL, Prisma                                  |
| 🔑 Auth     | bcrypt, JSON Web Tokens, Zod validation             |
| 🎨 Frontend | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |


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
npm install
npm run dev                   # or from repo root: npm run dev:frontend
```

The app runs at `http://localhost:3001`.

## 📁 Project structure

```
AppPulseCheck/
├── backend/          # Express API, Prisma, auth
├── frontend/         # Next.js app
└── package.json      # root scripts: dev:backend, dev:frontend
```

## 🗺️ Roadmap


| Milestone                    | Status         |
| ---------------------------- | -------------- |
| Core API and ping ingestion  | ✅ Shipped      |
| User auth and check CRUD     | ✅ Shipped      |
| Web dashboard                | 🔜 Planned     |
| Background status worker     | 🔜 Planned     |
| Alerting and notifications   | 🔜 Planned     |
| Resolution and deduplication | 🔜 Planned     |
| Production deployment        | 🔜 Planned     |


