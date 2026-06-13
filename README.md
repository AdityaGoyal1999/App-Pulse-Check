# App Pulse Check

![Checks](https://img.shields.io/github/checks-status/AdityaGoyal1999/App-Pulse-Check/master)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://app-pulse-check.vercel.app)
[![API](https://img.shields.io/badge/API-Railway-blue?logo=railway)](https://api-production-b6d49.up.railway.app/health)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)

**The heartbeat monitor for background jobs, cron tasks, and scripts.**

App Pulse Check is a lightweight uptime monitor for heartbeat-style jobs. Each monitored job gets a unique ping URL. When the job runs successfully, it calls that URL to signal it's alive. If pings stop arriving within the expected window, the check is marked down so you know something failed silently.

Built for indie hackers, solo developers, and small teams who need to know when scheduled or background work stops running — without standing up a full observability stack.

## 🌐 Live demo

The API is deployed on Railway. Hit the ping endpoint to see it in action:

**https://api-production-b6d49.up.railway.app/ping/7b1b7f6f-e22c-4268-91c1-6e6ca08047e4**

```bash
curl https://api-production-b6d49.up.railway.app/ping/7b1b7f6f-e22c-4268-91c1-6e6ca08047e4
```

## ✨ Features

### ✅ Available now

- 📡 **Ping endpoint** — `GET /ping/:uuid` logs each ping and marks the check as `UP`
- 💚 **Health check** — `GET /health` for basic server monitoring
- 🗄️ **Data model** — `User`, `Check`, and `PingLog` tables with check status (`NEW`, `UP`, `DOWN`)
- ⚡ **Local dev workflow** — one command starts Postgres, Prisma Studio, the evaluation worker, and the API server
- 🔐 **User authentication** — signup, login, and logout with JWT Bearer tokens (API + UI)
- 📋 **Check management API** — create, list, and delete checks (user-scoped, JWT protected)
- 🌐 **Landing page** — product positioning with login and signup entry points
- 📊 **Dashboard** — protected `/dashboard` with check list, status badges (`NEW` / `UP` / `DOWN`), relative last-ping times, copy-ping-URL, create, and delete
- ⏱️ **Missed-ping detection** — standalone evaluation worker runs every 60s and marks overdue checks `DOWN` (respects `intervalSeconds` + `graceSeconds`, skips paused checks)
- 🔔 **Down alerts** — Slack notifications when checks go down
- 💬 **Slack webhooks** — per-check Slack Incoming Webhook URLs for alert delivery
- 🚀 **Production deployment** — API hosted on Railway ([live demo](#-live-demo))
- 🔁 **Resolution and deduplication** — `alertSent` prevents repeat DOWN alerts; recovery pings mark checks `UP` again and send Slack recovery notifications

## 🔄 How it works

1. ➕ Sign up and create a check with an expected interval and grace period.
2. 🔗 Copy the ping URL and add a one-line HTTP call to your cron job, script, or background worker.
3. 👀 The dashboard shows live status; the evaluation worker flags checks `DOWN` when pings stop arriving on time.

## 🛠 Tech stack


| Layer            | Stack                                               |
| ---------------- | --------------------------------------------------- |
| ⚙️ API           | Node.js, TypeScript, Express                        |
| 🐘 Database      | PostgreSQL, Prisma                                  |
| 🔑 Auth          | bcrypt, JSON Web Tokens, Zod validation             |
| 🎨 Frontend      | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| ⚙️ Worker        | Standalone Node process (`backend/src/worker/`)     |
| 💬 Notifications | Slack Incoming Webhooks |


## 🚀 Getting started

### Prerequisites

- 🟢 Node.js
- 🐳 Docker (for local Postgres)

### ⚙️ Backend

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL and PORT
cp .env.example .env.local    # add JWT_SECRET (openssl rand -base64 32)
npm install
npm run dev:backend           # or from repo root: npm run dev:backend
```

The API runs at `http://localhost:3000`. Prisma Studio opens at `http://localhost:5555`. The evaluation worker starts automatically in the background (evaluates checks every 60s).

### 🎨 Frontend

```bash
cd frontend
echo 'NEXT_PUBLIC_API_URL=http://localhost:3000' > .env.local
npm install
npm run dev                   # or from repo root: npm run dev:frontend
```

The app runs at `http://localhost:3001`. Sign up, then open `/dashboard` to manage checks.

### ⏱️ Evaluation worker

The worker starts automatically with `npm run dev:backend` — no separate terminal needed. It evaluates all non-paused checks every 60 seconds. A check is marked `DOWN` when `now > lastPingedAt + intervalSeconds + graceSeconds`.

To run the worker alone (e.g. without the API):

```bash
npm run dev:worker           # from repo root
# or: cd backend && npm run dev:worker
```

### 🧪 Testing

**Unit tests** (fast, no running server):

```bash
cd backend && npm test
```

**E2E integration test** (full check lifecycle over HTTP — signup, ping UP, wait for DOWN, recovery, delete):

Prerequisites:
- API + worker + Postgres already running (`npm run dev:backend` from repo root)
- `curl` and `jq` installed (`brew install jq` on macOS)

```bash
cd backend && npm run test:e2e
```

Expect **~2–3 minutes** runtime (the script polls for up to 150s while waiting for the worker to mark the check DOWN). Override the API URL with `API_BASE` or `PORT` if needed.

## 📁 Project structure

```
AppPulseCheck/
├── backend/
│   ├── prisma/           # schema, migrations, seed
│   ├── src/
│   │   ├── routes/       # ping, auth, checks
│   │   ├── worker/       # missed-ping evaluation loop
│   │   └── ...
│   └── scripts/
│       ├── dev.sh         # Docker Postgres + Studio + worker + API
│       └── e2e-test.sh    # curl-based E2E lifecycle test
├── frontend/
│   └── src/
│       ├── app/          # landing, login, signup, dashboard
│       └── components/   # CheckList, StatusBadge, auth UI, etc.
└── package.json          # root scripts: dev:backend, dev:frontend, dev:worker, stop
```

## 🗺️ Roadmap


| Milestone                    | Status         |
| ---------------------------- | -------------- |
| Core API and ping ingestion  | ✅ Shipped      |
| User auth and check CRUD     | ✅ Shipped      |
| Web dashboard                | ✅ Shipped      |
| Background status worker     | ✅ Shipped      |
| Alerting and notifications   | ✅ Shipped      |
| E2E integration test         | ✅ Shipped      |
| Resolution and deduplication | ✅ Shipped      |
| Production deployment        | ✅ Shipped      |
| Subscription plans           | 🚧 In progress  |

### Subscription plans (up next)

We're rolling out tiered plans with usage limits and a pricing page:

| Plan            | Description                                      |
| --------------- | ------------------------------------------------ |
| **Free**        | Get started at no cost — monitors, alerts, dashboard |
| **Supporter**   | Paid tier for indie hackers who want to support the project |
| **Enterprise**  | Higher limits for teams running more checks      |
| **Enterprise+** | Top tier for large-scale monitoring workloads    |

