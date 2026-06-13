import type { Plan, Prisma } from "../../generated/prisma/client";
import { prisma } from "../db";
import { getLimitsForPlan } from "./plans";

type DbClient = Prisma.TransactionClient | typeof prisma;

export class CheckLimitError extends Error {
  constructor(
    public plan: Plan,
    public limit: number,
    public checkCount: number,
  ) {
    super("Check limit reached");
    this.name = "CheckLimitError";
  }
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!user) throw new Error("User not found");
  return user.plan;
}

export async function getUserLimits(userId: string) {
  const plan = await getUserPlan(userId);
  return { plan, limits: getLimitsForPlan(plan) };
}

export async function assertCanCreateCheck(userId: string): Promise<void> {
  const { plan, limits } = await getUserLimits(userId);
  const checkCount = await prisma.check.count({ where: { userId } });
  if (checkCount >= limits.maxChecks) {
    throw new CheckLimitError(plan, limits.maxChecks, checkCount);
  }
}

export async function trimExcessPingLogs(
  checkId: string,
  maxPingLogsPerCheck: number,
  db: DbClient = prisma,
): Promise<number> {
  const count = await db.pingLog.count({ where: { checkId } });
  const excess = count - maxPingLogsPerCheck;
  if (excess <= 0) return 0;

  const oldest = await db.pingLog.findMany({
    where: { checkId },
    orderBy: { pingedAt: "asc" },
    take: excess,
    select: { id: true },
  });

  const result = await db.pingLog.deleteMany({
    where: { id: { in: oldest.map((row) => row.id) } },
  });
  return result.count;
}
