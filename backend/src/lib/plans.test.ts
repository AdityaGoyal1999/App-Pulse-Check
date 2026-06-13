import { describe, expect, it } from "vitest";

import { getLimitsForPlan, PLAN_LIMITS } from "./plans";

describe("getLimitsForPlan", () => {
  it("returns Free tier limits", () => {
    expect(getLimitsForPlan("FREE")).toEqual(PLAN_LIMITS.FREE);
    expect(getLimitsForPlan("FREE")).toEqual({
      maxChecks: 20,
      maxPingLogsPerCheck: 100,
    });
  });

  it("returns Supporter tier limits", () => {
    expect(getLimitsForPlan("SUPPORTER")).toEqual({
      maxChecks: 20,
      maxPingLogsPerCheck: 100,
    });
  });

  it("returns Enterprise tier limits", () => {
    expect(getLimitsForPlan("ENTERPRISE")).toEqual({
      maxChecks: 100,
      maxPingLogsPerCheck: 1000,
    });
  });

  it("returns Enterprise Plus tier limits", () => {
    expect(getLimitsForPlan("ENTERPRISE_PLUS")).toEqual({
      maxChecks: 1000,
      maxPingLogsPerCheck: 1000,
    });
  });
});
