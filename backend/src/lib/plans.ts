import type { Plan } from "../../generated/prisma/client";

export const PLAN_LIMITS = {
  FREE: { maxChecks: 20, maxPingLogsPerCheck: 100 },
  SUPPORTER: { maxChecks: 20, maxPingLogsPerCheck: 100 },
  ENTERPRISE: { maxChecks: 100, maxPingLogsPerCheck: 1000 },
  ENTERPRISE_PLUS: { maxChecks: 1000, maxPingLogsPerCheck: 1000 },
} as const;

export type PlanLimits = (typeof PLAN_LIMITS)[Plan];

export function getLimitsForPlan(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}
