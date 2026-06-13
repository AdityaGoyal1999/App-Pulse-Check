import type { Plan } from "../../generated/prisma/client";
import { prisma } from "../db";
import { getLimitsForPlan } from "./plans";

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
