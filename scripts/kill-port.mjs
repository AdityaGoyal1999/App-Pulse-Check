#!/usr/bin/env node
import { execSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const port = process.argv[2];
if (!port) {
  console.error("Usage: node scripts/kill-port.mjs <port>");
  process.exit(1);
}

const LOG_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  ".cursor",
  "debug-bbdfcc.log",
);
const INGEST =
  "http://127.0.0.1:7243/ingest/59af508a-5786-4e02-9fd2-7d65f63a1b03";

function debugLog(hypothesisId, message, data) {
  const entry = {
    sessionId: "bbdfcc",
    runId: process.env.DEBUG_RUN_ID ?? "pre-fix",
    hypothesisId,
    location: "scripts/kill-port.mjs",
    message,
    data,
    timestamp: Date.now(),
  };
  // #region agent log
  try {
    appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
  } catch {
    /* ignore */
  }
  fetch(INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "bbdfcc",
    },
    body: JSON.stringify(entry),
  }).catch(() => {});
  // #endregion
}

let pids = [];
try {
  const out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
  pids = out ? out.split("\n").filter(Boolean) : [];
} catch {
  pids = [];
}

debugLog("H1", "port scan before kill", { port, pids, found: pids.length > 0 });

if (pids.length === 0) {
  console.log(`Port ${port} is free.`);
  debugLog("H3", "no listener on port", { port });
  process.exit(0);
}

for (const pid of pids) {
  let command = "unknown";
  try {
    command = execSync(`ps -p ${pid} -o command=`, {
      encoding: "utf8",
    }).trim();
  } catch {
    /* process may have exited */
  }

  debugLog("H1", "killing process on port", { port, pid, command });

  try {
    process.kill(Number(pid), "SIGTERM");
    console.log(`Stopped PID ${pid} on port ${port} (${command})`);
  } catch (err) {
    debugLog("H5", "failed to kill process", {
      port,
      pid,
      error: err instanceof Error ? err.message : String(err),
    });
    console.warn(`Could not stop PID ${pid}: ${err}`);
  }
}

// Brief wait then verify port is free
try {
  execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`, { stdio: "pipe" });
  debugLog("H5", "port still in use after SIGTERM", { port });
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGKILL");
      console.log(`Force-stopped PID ${pid} on port ${port}`);
    } catch {
      /* ignore */
    }
  }
} catch {
  debugLog("H1", "port free after cleanup", { port });
}
