---
name: Day 1 Foundation Plan
overview: "Day 1 establishes the backend foundation for App Pulse Check: project scaffolding, PostgreSQL + Prisma data model (Users, Checks, PingLogs), UUID indexing, and the critical GET /ping/:uuid endpoint that logs pings and marks checks as UP."
todos:
  - id: system-design
    content: "Finalize data model: User, Check (with status enum + uuid), PingLog; document ping flow"
    status: pending
  - id: scaffold-project
    content: Initialize Node/TS project, Express server, .env.example, Docker Postgres, Prisma init
    status: pending
  - id: prisma-schema
    content: Write schema.prisma with @unique on Checks.uuid, run migrate dev, add seed script
    status: pending
  - id: ping-endpoint
    content: Implement GET /ping/:uuid with transactional PingLog insert + Check status=UP update
    status: pending
  - id: verify-day1
    content: "Test with curl: 200 on valid UUID, 404 on invalid, confirm DB state in Prisma Studio"
    status: pending
  - id: git-init
    content: git init, .gitignore, first commit with backend scaffold (no .env)
    status: pending
isProject: false
---

# Day 1: System Design, Database Schema & Core Ping API

You are starting from an empty workspace at [`/Users/adityagoyal/Projects/IndieHacks/AppPulseCheck`](file:///Users/adityagoyal/Projects/IndieHacks/AppPulseCheck). Day 1 is backend-only — auth, dashboard, and the evaluation engine come on Days 2–4.

## What Success Looks Like Today

By end of Day 1, you should be able to:

1. Run a local API server
2. Seed or manually insert a `Check` row with a UUID
3. Hit `GET /ping/:uuid` and see:
   - A new row in `PingLogs`
   - `Checks.lastPingedAt` updated
   - `Checks.status` set to `UP`

```mermaid
sequenceDiagram
    participant Script as ExternalScript
    participant API as PingAPI
    participant DB as PostgreSQL

    Script->>API: GET /ping/:uuid
    API->>DB: Lookup Check by uuid (indexed)
    alt Check exists
        API->>DB: Insert PingLog
        API->>DB: Update Check status=UP, lastPingedAt=now
        API-->>Script: 200 OK
    else Check not found
        API-->>Script: 404 Not Found
    end
```

---

## Step 1: System Design (30–45 min)

Before writing code, lock in the data model. This schema supports Day 1 and leaves room for Days 2–6 without rework.

### Entities

| Table | Purpose | Key fields for Day 1 |
|-------|---------|----------------------|
| **User** | Owner of checks (auth on Day 2) | `id`, `email`, `passwordHash`, `createdAt` |
| **Check** | A monitored heartbeat job | `id`, `uuid` (public ping token), `userId`, `name`, `intervalSeconds`, `graceSeconds`, `status`, `lastPingedAt` |
| **PingLog** | Audit trail of every ping | `id`, `checkId`, `pingedAt` |

### Check status enum (use from Day 1)

- `NEW` — created, never pinged (Day 3 dashboard: grey badge)
- `UP` — last ping within expected window
- `DOWN` — grace period expired (set by Day 4 worker)

Day 1 only writes `UP`; default new checks to `NEW`.

### Indexing requirement (from PDF)

Add a **unique index on `Checks.uuid`** for O(1) lookups on every ping. Prisma: `@@index([uuid])` or `@unique` on `uuid` (prefer `@unique` since UUIDs are one-to-one with a check).

### Suggested repo layout (backend-only for now)

```
AppPulseCheck/
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   └── schema.prisma
└── src/
    ├── index.ts          # server entry
    ├── app.ts            # express/fastify app setup
    ├── db.ts             # Prisma client singleton
    └── routes/
        └── ping.ts       # GET /ping/:uuid
```

Frontend (`apps/web` or similar) can be added on Day 3. Keep Day 1 scope tight.

---

## Step 2: Initialize the Project (45–60 min)

### 2a. Scaffold Node + TypeScript backend

```bash
cd /Users/adityagoyal/Projects/IndieHacks/AppPulseCheck
npm init -y
npm install express prisma @prisma/client
npm install -D typescript tsx @types/node @types/express
npx tsc --init
```

**Framework choice:** PDF lists Express but mentions Fastify for throughput. For Day 1, **Express is fine** (simpler, more tutorials). Switching to Fastify later is a small refactor. If you already prefer Fastify, use it now — the rest of the plan is identical.

### 2b. Local PostgreSQL

Run Postgres locally (Docker is easiest):

```bash
docker run --name pulsecheck-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pulsecheck -p 5432:5432 -d postgres:16
```

Set `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pulsecheck"
PORT=3000
```

Add `.env` to `.gitignore`. Commit `.env.example` with placeholder values.

### 2c. Initialize Prisma

```bash
npx prisma init
```

---

## Step 3: Database Schema (60–90 min)

Define [`prisma/schema.prisma`](prisma/schema.prisma) with these models:

```prisma
enum CheckStatus {
  NEW
  UP
  DOWN
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  checks       Check[]
}

model Check {
  id              String      @id @default(cuid())
  uuid            String      @unique @default(uuid())
  userId          String
  name            String
  intervalSeconds Int
  graceSeconds    Int
  status          CheckStatus @default(NEW)
  lastPingedAt    DateTime?
  createdAt       DateTime    @default(now())
  user            User        @relation(fields: [userId], references: [id])
  pingLogs        PingLog[]

  @@index([userId])
}

model PingLog {
  id       String   @id @default(cuid())
  checkId  String
  pingedAt DateTime @default(now())
  check    Check    @relation(fields: [checkId], references: [id])

  @@index([checkId])
}
```

Then migrate:

```bash
npx prisma migrate dev --name init
```

### Seed data for manual testing (Day 1 has no auth API yet)

Create [`prisma/seed.ts`](prisma/seed.ts) to insert one user + one check so you can test pings immediately:

```bash
npm install -D ts-node
# add "prisma": { "seed": "tsx prisma/seed.ts" } to package.json
npx prisma db seed
```

---

## Step 4: Core Ping API (90–120 min)

Implement `GET /ping/:uuid` in [`src/routes/ping.ts`](src/routes/ping.ts).

### Behavior

1. Parse `uuid` from route param
2. `findUnique({ where: { uuid } })` — uses unique index
3. If not found → `404 { error: "Check not found" }`
4. If found, in a **single transaction**:
   - `PingLog.create({ checkId, pingedAt: now })`
   - `Check.update({ status: UP, lastPingedAt: now })`
5. Return `200 { ok: true, checkId, pingedAt }`

### Why a transaction?

Ensures ping log and status update are atomic — no orphaned logs or stale status if one write fails.

### Server wiring

In [`src/index.ts`](src/index.ts):

- Mount ping router at `/ping`
- Add basic health route: `GET /health` → `{ status: "ok" }`
- Listen on `PORT` from env

### Error handling (minimal for Day 1)

- Invalid/missing UUID format → still attempt lookup; return 404 if not in DB
- DB connection errors → `500` with generic message (no stack traces in production)

---

## Step 5: Verify Day 1 Deliverables (30 min)

Run through this checklist:

| Check | How to verify |
|-------|---------------|
| Repo initialized with TypeScript | `npm run dev` starts without errors |
| Schema has Users, Checks, PingLogs | `npx prisma studio` shows all 3 tables |
| UUID index on Checks | Confirm `@unique` on `uuid` in schema; `EXPLAIN` on lookup optional |
| Ping endpoint works | `curl http://localhost:3000/ping/<seed-uuid>` returns 200 |
| Status → UP | Check row shows `status: UP` after ping |
| Ping logged | New `PingLog` row with correct `checkId` and timestamp |
| Unknown UUID | `curl .../ping/bad-uuid` returns 404 |

Optional but useful: add an npm script `"dev": "tsx watch src/index.ts"`.

---

## Step 6: Git Hygiene (15 min)

Initialize git and make your first commit:

- `package.json`, `tsconfig.json`, `prisma/`, `src/`, `.env.example`, `.gitignore`
- Do **not** commit `.env`

Suggested commit message: `feat: scaffold backend and implement ping endpoint`

---

## Explicitly Out of Scope for Day 1

Do not build these today — they are scheduled for later days:

- JWT/auth, signup/login (Day 2)
- `POST/GET/DELETE /api/checks` (Day 2)
- React/Next.js dashboard (Day 3)
- Background evaluation worker (Day 4)
- Alerting (Day 5)
- Resolution handling / alert dedup (Day 6)
- Production deploy (Day 7)

---

## Suggested Time Budget (~6–8 hours)

```mermaid
gantt
    title Day1_TimeBudget
    dateFormat HH:mm
    axisFormat %H:%M
    section Morning
    SystemDesign           :09:00, 45m
    ProjectScaffold        :09:45, 60m
    section Midday
    PrismaSchemaAndMigrate :10:45, 90m
    section Afternoon
    PingEndpoint           :12:15, 120m
    TestingAndGit          :14:15, 45m
```

---

## Risks and Decisions

| Decision | Recommendation |
|----------|----------------|
| Express vs Fastify | Express for Day 1 speed; migrate later if needed |
| `uuid` vs `cuid` for ping token | Use `uuid()` — matches PDF example URLs |
| Monorepo now? | No — single backend package until Day 3 |
| `userId` required on Check? | Yes — schema is ready for Day 2 auth; seed a dummy user today |

---

## Reference: Competitor UX north star

PDF cites [launchfastlegacyx.com](https://launchfastlegacyx.com/) as UI inspiration — not relevant for Day 1 coding, but keep it in mind for Day 3 dashboard polish.
