import type { Plan } from "../../generated/prisma/client";
import { prisma } from "../db";
import type {
  StripeCustomerRef,
  Subscription,
  SubscriptionStatus,
} from "./stripe-types";

const CHECKOUT_PLANS = ["SUPPORTER"] as const;
export type CheckoutPlan = (typeof CHECKOUT_PLANS)[number];

export function isCheckoutPlan(plan: string): plan is CheckoutPlan {
  return (CHECKOUT_PLANS as readonly string[]).includes(plan);
}

function enterprisePriceId(): string | undefined {
  return process.env.STRIPE_PRICE_ENTERPRISE ?? process.env.STRIPE_PRICE_BUSINESS;
}

function enterprisePlusPriceId(): string | undefined {
  return (
    process.env.STRIPE_PRICE_ENTERPRISE_PLUS ??
    process.env.STRIPE_PRICE_BUSINESS_PLUS
  );
}

export function getPriceIdForPlan(plan: Plan): string | null {
  switch (plan) {
    case "SUPPORTER":
      return process.env.STRIPE_PRICE_SUPPORTER ?? null;
    case "ENTERPRISE":
      return enterprisePriceId() ?? null;
    case "ENTERPRISE_PLUS":
      return enterprisePlusPriceId() ?? null;
    default:
      return null;
  }
}

export function planFromPriceId(priceId: string): Plan | null {
  if (priceId === process.env.STRIPE_PRICE_SUPPORTER) return "SUPPORTER";
  if (priceId === enterprisePriceId()) return "ENTERPRISE";
  if (priceId === enterprisePlusPriceId()) return "ENTERPRISE_PLUS";
  return null;
}

const ACTIVE_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  "active",
  "trialing",
  "past_due",
]);

const TERMINAL_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  "canceled",
  "unpaid",
  "incomplete_expired",
]);

export function resolvePlanFromSubscription(
  subscription: Pick<Subscription, "status" | "items">,
): Plan {
  if (TERMINAL_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    return "FREE";
  }

  if (!ACTIVE_SUBSCRIPTION_STATUSES.has(subscription.status)) {
    return "FREE";
  }

  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return "FREE";

  return planFromPriceId(priceId) ?? "FREE";
}

export function getStripeCustomerId(
  customer: StripeCustomerRef,
): string | null {
  if (!customer || typeof customer === "string") {
    return customer;
  }

  if ("deleted" in customer && customer.deleted) {
    return null;
  }

  return customer.id;
}

export async function syncUserPlanFromSubscription(
  userId: string,
  subscription: Subscription,
): Promise<Plan> {
  const plan = resolvePlanFromSubscription(subscription);
  const customerId = getStripeCustomerId(subscription.customer);

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId:
        TERMINAL_SUBSCRIPTION_STATUSES.has(subscription.status)
          ? null
          : subscription.id,
    },
  });

  return plan;
}

export async function downgradeUserToFree(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "FREE",
      stripeSubscriptionId: null,
    },
  });
}

export async function findUserIdByStripeCustomerId(
  customerId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}
