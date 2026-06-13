import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Subscription } from "./stripe-types";

const { userUpdate, userFindUnique } = vi.hoisted(() => ({
  userUpdate: vi.fn(),
  userFindUnique: vi.fn(),
}));

vi.mock("../db", () => ({
  prisma: {
    user: {
      update: userUpdate,
      findUnique: userFindUnique,
    },
  },
}));

import {
  downgradeUserToFree,
  findUserIdByStripeCustomerId,
  getPriceIdForPlan,
  planFromPriceId,
  resolvePlanFromSubscription,
  syncUserPlanFromSubscription,
} from "./billing";

function subscription(
  overrides: Partial<Subscription> & {
    status: Subscription["status"];
    priceId?: string;
  },
): Subscription {
  const priceId = overrides.priceId ?? "price_supporter";
  return {
    id: "sub_123",
    customer: "cus_123",
    status: overrides.status,
    metadata: {},
    items: {
      object: "list",
      data: [
        {
          id: "si_123",
          price: { id: priceId },
        },
      ],
      has_more: false,
      url: "/v1/subscription_items",
    },
    ...overrides,
  } as Subscription;
}

describe("planFromPriceId", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_PRICE_SUPPORTER: "price_supporter",
      STRIPE_PRICE_ENTERPRISE: "price_enterprise",
      STRIPE_PRICE_ENTERPRISE_PLUS: "price_enterprise_plus",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("maps supporter price id to SUPPORTER", () => {
    expect(planFromPriceId("price_supporter")).toBe("SUPPORTER");
  });

  it("maps enterprise price id to ENTERPRISE", () => {
    expect(planFromPriceId("price_enterprise")).toBe("ENTERPRISE");
  });

  it("maps enterprise plus price id to ENTERPRISE_PLUS", () => {
    expect(planFromPriceId("price_enterprise_plus")).toBe("ENTERPRISE_PLUS");
  });

  it("returns null for unknown price ids", () => {
    expect(planFromPriceId("price_unknown")).toBeNull();
  });
});

describe("getPriceIdForPlan", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_PRICE_SUPPORTER: "price_supporter",
      STRIPE_PRICE_ENTERPRISE: "price_enterprise",
      STRIPE_PRICE_ENTERPRISE_PLUS: "price_enterprise_plus",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns configured price ids for paid plans", () => {
    expect(getPriceIdForPlan("SUPPORTER")).toBe("price_supporter");
    expect(getPriceIdForPlan("ENTERPRISE")).toBe("price_enterprise");
    expect(getPriceIdForPlan("ENTERPRISE_PLUS")).toBe("price_enterprise_plus");
  });

  it("returns null for the free plan", () => {
    expect(getPriceIdForPlan("FREE")).toBeNull();
  });
});

describe("resolvePlanFromSubscription", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_PRICE_SUPPORTER: "price_supporter",
      STRIPE_PRICE_ENTERPRISE: "price_enterprise",
      STRIPE_PRICE_ENTERPRISE_PLUS: "price_enterprise_plus",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns SUPPORTER for active supporter subscriptions", () => {
    expect(
      resolvePlanFromSubscription(
        subscription({ status: "active", priceId: "price_supporter" }),
      ),
    ).toBe("SUPPORTER");
  });

  it("keeps paid plan during past_due grace", () => {
    expect(
      resolvePlanFromSubscription(
        subscription({ status: "past_due", priceId: "price_supporter" }),
      ),
    ).toBe("SUPPORTER");
  });

  it("downgrades canceled subscriptions to FREE", () => {
    expect(
      resolvePlanFromSubscription(
        subscription({ status: "canceled", priceId: "price_supporter" }),
      ),
    ).toBe("FREE");
  });

  it("downgrades unpaid subscriptions to FREE", () => {
    expect(
      resolvePlanFromSubscription(
        subscription({ status: "unpaid", priceId: "price_supporter" }),
      ),
    ).toBe("FREE");
  });
});

describe("syncUserPlanFromSubscription", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      STRIPE_PRICE_SUPPORTER: "price_supporter",
    };
    userUpdate.mockReset();
    userUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("stores supporter plan and stripe ids for active subscriptions", async () => {
    await syncUserPlanFromSubscription(
      "user-1",
      subscription({ status: "active", priceId: "price_supporter" }),
    );

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        plan: "SUPPORTER",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
      },
    });
  });

  it("clears subscription id when subscription is canceled", async () => {
    await syncUserPlanFromSubscription(
      "user-1",
      subscription({ status: "canceled", priceId: "price_supporter" }),
    );

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        plan: "FREE",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: null,
      },
    });
  });
});

describe("downgradeUserToFree", () => {
  beforeEach(() => {
    userUpdate.mockReset();
    userUpdate.mockResolvedValue({});
  });

  it("sets plan to FREE and clears subscription id", async () => {
    await downgradeUserToFree("user-1");

    expect(userUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        plan: "FREE",
        stripeSubscriptionId: null,
      },
    });
  });
});

describe("findUserIdByStripeCustomerId", () => {
  beforeEach(() => {
    userFindUnique.mockReset();
  });

  it("returns the matching user id", async () => {
    userFindUnique.mockResolvedValue({ id: "user-1" });

    await expect(findUserIdByStripeCustomerId("cus_123")).resolves.toBe(
      "user-1",
    );
  });

  it("returns null when no user matches", async () => {
    userFindUnique.mockResolvedValue(null);

    await expect(findUserIdByStripeCustomerId("cus_missing")).resolves.toBeNull();
  });
});
