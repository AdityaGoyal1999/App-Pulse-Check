import { getLimitsForPlan } from "../lib/plans";
import { trimExcessPingLogs } from "../lib/limits";
import { prisma } from "../db";

const INTERVAL_MS = 60 * 60 * 1000;

export async function runRetention(): Promise<number> {
  const checks = await prisma.check.findMany({
    select: {
      id: true,
      user: { select: { plan: true } },
    },
  });

  let totalTrimmed = 0;
  for (const check of checks) {
    const limit = getLimitsForPlan(check.user.plan).maxPingLogsPerCheck;
    totalTrimmed += await trimExcessPingLogs(check.id, limit);
  }
  return totalTrimmed;
}

export function startRetention(): void {
  console.log("Retention worker started");

  const run = async () => {
    try {
      const trimmed = await runRetention();
      if (trimmed > 0) {
        console.log(`Trimmed ${trimmed} ping log(s) across all checks`);
      }
    } catch (err) {
      console.error("Retention failed:", err);
    }
  };

  void run();

  const timer = setInterval(() => void run(), INTERVAL_MS);

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down retention worker...`);
    clearInterval(timer);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}
