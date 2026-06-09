# App Pulse Check

## What is the project

App Pulse Check is a heartbeat monitoring service for background jobs, cron tasks, and scripts. Each monitored job gets a unique ping URL. When the job runs successfully, it calls that URL to signal it's alive. If pings stop arriving within the expected window, the check is marked down so you know something failed silently.

## Who is it for

This is built for indie hackers, solo developers, and small teams who run scheduled or background work and need a simple way to know when a job stops running — without standing up a full observability stack.

## What the project has so far

Day 1 backend foundation is in place:

- **Node.js + TypeScript + Express** API server
- **PostgreSQL** via Docker, with **Prisma** for the data layer
- **Data model**: `User`, `Check`, and `PingLog` tables, with check status (`NEW`, `UP`, `DOWN`)
- **`GET /ping/:uuid`** — logs each ping and marks the check as `UP`
- **`GET /health`** — basic server health check
- **Seed script** — creates a test user and check for local development
- **Dev workflow** — `npm run dev:backend` starts Postgres, Prisma Studio, and the API server

## What we're building

The full product is a lightweight uptime monitor for heartbeat-style jobs:

| Phase | Focus |
|-------|-------|
| Day 2 | User auth and CRUD API for checks |
| Day 3 | Dashboard to view check status |
| Day 4 | Background worker to detect missed pings and mark checks `DOWN` |
| Day 5 | Alerting when checks go down |
| Day 6 | Resolution handling and alert deduplication |
| Day 7 | Production deployment |

The end goal: create a check, add a one-line ping call to your cron job or script, and get notified when it stops checking in.
