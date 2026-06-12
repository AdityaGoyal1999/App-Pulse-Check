import { CheckStatus } from "../../generated/prisma/client";
import { sendDownAlert } from "../lib/alerts";
import { prisma } from "../db";

const INTERVAL_MS = 60_000;

export const EVALUATOR_CANDIDATE_WHERE = {
  paused: false,
  lastPingedAt: { not: null },
  status: { in: [CheckStatus.NEW, CheckStatus.UP] },
};

export type EvaluatorCandidate = {
  id: string;
  name: string;
  lastPingedAt: Date;
  intervalSeconds: number;
  graceSeconds: number;
  alertWebhookUrl: string | null;
  alertEmail: string | null;
};

export function isCheckOverdue(
  check: Pick<
    EvaluatorCandidate,
    "lastPingedAt" | "intervalSeconds" | "graceSeconds"
  >,
  now: number,
): boolean {
  const deadline =
    check.lastPingedAt.getTime() +
    check.intervalSeconds * 1000 +
    check.graceSeconds * 1000;
  return now > deadline;
}

export function filterOverdueChecks(
  candidates: EvaluatorCandidate[],
  now: number,
): EvaluatorCandidate[] {
  return candidates.filter((check) => isCheckOverdue(check, now));
}

export async function evaluateChecks(): Promise<number> {
  const candidates = await prisma.check.findMany({
    where: EVALUATOR_CANDIDATE_WHERE,
    select: {
      id: true,
      name: true,
      lastPingedAt: true,
      intervalSeconds: true,
      graceSeconds: true,
      alertWebhookUrl: true,
      alertEmail: true,
    },
  });

  const now = Date.now();

  const overdueChecks = filterOverdueChecks(
    candidates.flatMap((check) =>
      check.lastPingedAt
        ? [
            {
              id: check.id,
              name: check.name,
              lastPingedAt: check.lastPingedAt,
              intervalSeconds: check.intervalSeconds,
              graceSeconds: check.graceSeconds,
              alertWebhookUrl: check.alertWebhookUrl,
              alertEmail: check.alertEmail,
            },
          ]
        : [],
    ),
    now,
  );

  if (overdueChecks.length === 0) {
    return 0;
  }

  await Promise.allSettled(
    overdueChecks.map((check) =>
      sendDownAlert(
        { name: check.name, lastPingedAt: check.lastPingedAt },
        {
          alertWebhookUrl: check.alertWebhookUrl,
          alertEmail: check.alertEmail,
        },
      ),
    ),
  );

  const result = await prisma.check.updateMany({
    where: { id: { in: overdueChecks.map((c) => c.id) } },
    data: { status: CheckStatus.DOWN, alertSent: true },
  });

  console.log(`Marked ${result.count} check(s) DOWN`);
  return result.count;
}

export function startEvaluator(): void {
  console.log("Evaluation worker started");

  const run = async () => {
    try {
      await evaluateChecks();
    } catch (err) {
      console.error("Evaluation failed:", err);
    }
  };

  void run();

  const timer = setInterval(() => void run(), INTERVAL_MS);

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down worker...`);
    clearInterval(timer);
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}
