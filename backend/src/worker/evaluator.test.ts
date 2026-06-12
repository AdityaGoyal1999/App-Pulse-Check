import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckStatus } from "../../generated/prisma/client";

const { findMany, updateMany, sendDownAlert } = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(),
  sendDownAlert: vi.fn(),
}));

vi.mock("../db", () => ({
  prisma: {
    check: {
      findMany,
      updateMany,
    },
  },
}));

vi.mock("../lib/alerts", () => ({
  sendDownAlert: (...args: unknown[]) => sendDownAlert(...args),
}));

import {
  EVALUATOR_CANDIDATE_WHERE,
  evaluateChecks,
  filterOverdueChecks,
  isCheckOverdue,
  type EvaluatorCandidate,
} from "./evaluator";

function makeCandidate(
  overrides: Partial<EvaluatorCandidate> = {},
): EvaluatorCandidate {
  return {
    id: "check-1",
    name: "Test check",
    lastPingedAt: new Date("2026-01-01T00:00:00.000Z"),
    intervalSeconds: 60,
    graceSeconds: 30,
    alertWebhookUrl: "https://hooks.slack.com/services/test",
    alertEmail: null,
    ...overrides,
  };
}

describe("isCheckOverdue", () => {
  it("returns true when now is past interval + grace", () => {
    const check = makeCandidate({
      lastPingedAt: new Date("2026-01-01T00:00:00.000Z"),
      intervalSeconds: 60,
      graceSeconds: 30,
    });
    const now = check.lastPingedAt.getTime() + 91_000;

    expect(isCheckOverdue(check, now)).toBe(true);
  });

  it("returns false when still inside grace window", () => {
    const check = makeCandidate({
      lastPingedAt: new Date("2026-01-01T00:00:00.000Z"),
      intervalSeconds: 60,
      graceSeconds: 30,
    });
    const now = check.lastPingedAt.getTime() + 60_000;

    expect(isCheckOverdue(check, now)).toBe(false);
  });
});

describe("filterOverdueChecks", () => {
  it("keeps only overdue candidates", () => {
    const overdue = makeCandidate({ id: "overdue" });
    const fresh = makeCandidate({
      id: "fresh",
      lastPingedAt: new Date(),
      intervalSeconds: 3600,
      graceSeconds: 0,
    });
    const now = overdue.lastPingedAt.getTime() + 120_000;

    expect(filterOverdueChecks([overdue, fresh], now)).toEqual([overdue]);
  });
});

describe("EVALUATOR_CANDIDATE_WHERE", () => {
  it("excludes paused checks from worker evaluation", () => {
    expect(EVALUATOR_CANDIDATE_WHERE.paused).toBe(false);
    expect(EVALUATOR_CANDIDATE_WHERE.status.in).toEqual([
      CheckStatus.NEW,
      CheckStatus.UP,
    ]);
    expect(EVALUATOR_CANDIDATE_WHERE.alertSent).toBe(false);
  });
});

describe("evaluateChecks", () => {
  beforeEach(() => {
    findMany.mockReset();
    updateMany.mockReset();
    sendDownAlert.mockReset();
    sendDownAlert.mockResolvedValue(undefined);
    updateMany.mockResolvedValue({ count: 0 });
  });

  it("queries only non-paused NEW/UP checks that have pinged", async () => {
    findMany.mockResolvedValue([]);

    await evaluateChecks();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: EVALUATOR_CANDIDATE_WHERE,
      }),
    );
  });

  it("does not send alerts when no candidates are returned (paused checks skipped)", async () => {
    findMany.mockResolvedValue([]);

    const count = await evaluateChecks();

    expect(count).toBe(0);
    expect(sendDownAlert).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("does not alert for unpaused checks that are not overdue yet", async () => {
    findMany.mockResolvedValue([
      makeCandidate({
        lastPingedAt: new Date(),
        intervalSeconds: 3600,
        graceSeconds: 0,
      }),
    ]);

    const count = await evaluateChecks();

    expect(count).toBe(0);
    expect(sendDownAlert).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("alerts and marks DOWN for unpaused overdue checks", async () => {
    const overdue = makeCandidate();
    findMany.mockResolvedValue([overdue]);
    updateMany.mockResolvedValue({ count: 1 });

    const count = await evaluateChecks();

    expect(count).toBe(1);
    expect(sendDownAlert).toHaveBeenCalledTimes(1);
    expect(sendDownAlert).toHaveBeenCalledWith(
      { name: overdue.name, lastPingedAt: overdue.lastPingedAt },
      {
        alertWebhookUrl: overdue.alertWebhookUrl,
        alertEmail: overdue.alertEmail,
      },
    );
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: { in: [overdue.id] } },
      data: { status: CheckStatus.DOWN, alertSent: true },
    });
  });

  it("evaluates resumed checks once they appear in candidate query results", async () => {
    const resumedOverdue = makeCandidate({ id: "resumed-check" });
    findMany.mockResolvedValue([resumedOverdue]);
    updateMany.mockResolvedValue({ count: 1 });

    const count = await evaluateChecks();

    expect(count).toBe(1);
    expect(sendDownAlert).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ["resumed-check"] } },
      }),
    );
  });
});
