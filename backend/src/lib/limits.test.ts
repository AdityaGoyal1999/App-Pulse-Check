import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  userFindUnique,
  checkCount,
  pingLogCount,
  pingLogFindMany,
  pingLogDeleteMany,
} = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  checkCount: vi.fn(),
  pingLogCount: vi.fn(),
  pingLogFindMany: vi.fn(),
  pingLogDeleteMany: vi.fn(),
}));

vi.mock("../db", () => ({
  prisma: {
    user: { findUnique: userFindUnique },
    check: { count: checkCount },
    pingLog: {
      count: pingLogCount,
      findMany: pingLogFindMany,
      deleteMany: pingLogDeleteMany,
    },
  },
}));

import {
  assertCanCreateCheck,
  CheckLimitError,
  getUserLimits,
  getUserPlan,
  trimExcessPingLogs,
} from "./limits";

describe("getUserPlan", () => {
  beforeEach(() => {
    userFindUnique.mockReset();
  });

  it("returns the user's plan", async () => {
    userFindUnique.mockResolvedValue({ plan: "FREE" });

    await expect(getUserPlan("user-1")).resolves.toBe("FREE");
    expect(userFindUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: { plan: true },
    });
  });

  it("throws when user is not found", async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(getUserPlan("missing")).rejects.toThrow("User not found");
  });
});

describe("getUserLimits", () => {
  beforeEach(() => {
    userFindUnique.mockReset();
  });

  it("resolves limits from the user's plan", async () => {
    userFindUnique.mockResolvedValue({ plan: "ENTERPRISE" });

    await expect(getUserLimits("user-1")).resolves.toEqual({
      plan: "ENTERPRISE",
      limits: { maxChecks: 100, maxPingLogsPerCheck: 1000 },
    });
  });
});

describe("assertCanCreateCheck", () => {
  beforeEach(() => {
    userFindUnique.mockReset();
    checkCount.mockReset();
  });

  it("allows creation when under the plan check cap", async () => {
    userFindUnique.mockResolvedValue({ plan: "FREE" });
    checkCount.mockResolvedValue(19);

    await expect(assertCanCreateCheck("user-1")).resolves.toBeUndefined();
  });

  it("throws CheckLimitError at the plan check cap", async () => {
    userFindUnique.mockResolvedValue({ plan: "FREE" });
    checkCount.mockResolvedValue(20);

    await expect(assertCanCreateCheck("user-1")).rejects.toMatchObject({
      name: "CheckLimitError",
      plan: "FREE",
      limit: 20,
      checkCount: 20,
    });
  });

  it("throws CheckLimitError above the plan check cap", async () => {
    userFindUnique.mockResolvedValue({ plan: "FREE" });
    checkCount.mockResolvedValue(21);

    try {
      await assertCanCreateCheck("user-1");
      expect.fail("expected CheckLimitError");
    } catch (err) {
      expect(err).toBeInstanceOf(CheckLimitError);
      expect(err).toMatchObject({
        plan: "FREE",
        limit: 20,
        checkCount: 21,
      });
    }
  });

  it("uses Enterprise limits for Enterprise users", async () => {
    userFindUnique.mockResolvedValue({ plan: "ENTERPRISE" });
    checkCount.mockResolvedValue(100);

    await expect(assertCanCreateCheck("user-1")).rejects.toMatchObject({
      plan: "ENTERPRISE",
      limit: 100,
      checkCount: 100,
    });
  });
});

describe("trimExcessPingLogs", () => {
  const checkId = "check-1";
  const db = {
    pingLog: {
      count: pingLogCount,
      findMany: pingLogFindMany,
      deleteMany: pingLogDeleteMany,
    },
  };

  beforeEach(() => {
    pingLogCount.mockReset();
    pingLogFindMany.mockReset();
    pingLogDeleteMany.mockReset();
  });

  it("returns 0 when at or under the retention limit", async () => {
    pingLogCount.mockResolvedValue(100);

    await expect(trimExcessPingLogs(checkId, 100, db)).resolves.toBe(0);
    expect(pingLogFindMany).not.toHaveBeenCalled();
    expect(pingLogDeleteMany).not.toHaveBeenCalled();
  });

  it("deletes oldest logs when count exceeds the retention limit", async () => {
    pingLogCount.mockResolvedValue(105);
    pingLogFindMany.mockResolvedValue([
      { id: "log-1" },
      { id: "log-2" },
      { id: "log-3" },
      { id: "log-4" },
      { id: "log-5" },
    ]);
    pingLogDeleteMany.mockResolvedValue({ count: 5 });

    await expect(trimExcessPingLogs(checkId, 100, db)).resolves.toBe(5);

    expect(pingLogFindMany).toHaveBeenCalledWith({
      where: { checkId },
      orderBy: { pingedAt: "asc" },
      take: 5,
      select: { id: true },
    });
    expect(pingLogDeleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["log-1", "log-2", "log-3", "log-4", "log-5"] } },
    });
  });

  it("trims 1 log when one ping over the 100-log Free tier cap", async () => {
    pingLogCount.mockResolvedValue(101);
    pingLogFindMany.mockResolvedValue([{ id: "oldest-log" }]);
    pingLogDeleteMany.mockResolvedValue({ count: 1 });

    await expect(trimExcessPingLogs(checkId, 100, db)).resolves.toBe(1);

    expect(pingLogFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 }),
    );
  });
});
