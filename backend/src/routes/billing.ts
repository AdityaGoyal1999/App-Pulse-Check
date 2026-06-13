import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../db";
import {
  findUserIdByStripeCustomerId,
  getPriceIdForPlan,
  syncUserPlanFromSubscription,
  downgradeUserToFree,
} from "../lib/billing";
import { getFrontendUrl, getStripe } from "../lib/stripe";
import type { CheckoutSession, StripeEvent, Subscription } from "../lib/stripe-types";
import { requireAuth } from "../middleware/auth";
import {
  checkoutBodySchema,
  confirmCheckoutBodySchema,
} from "../schemas/billing";

export const billingRouter = Router();

billingRouter.use(requireAuth);

billingRouter.get("/status", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.stripeSubscriptionId) {
      res.status(200).json({
        plan: user.plan,
        subscriptionStatus: null,
        currentPeriodEnd: null,
      });
      return;
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
    );

    res.status(200).json({
      plan: user.plan,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: subscription.items.data[0]?.current_period_end
        ? new Date(
            subscription.items.data[0].current_period_end * 1000,
          ).toISOString()
        : null,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

billingRouter.post("/checkout", async (req, res) => {
  const parsed = checkoutBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const priceId = getPriceIdForPlan(parsed.data.plan);
  if (!priceId) {
    res.status(500).json({ error: "Billing is not configured for this plan" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, stripeCustomerId: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const stripe = getStripe();
    const frontendUrl = getFrontendUrl();

    const sessionParams = {
      mode: "subscription" as const,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: user.id, plan: parsed.data.plan },
      subscription_data: {
        metadata: { userId: user.id, plan: parsed.data.plan },
      },
      success_url: `${frontendUrl}/settings/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/settings/billing?canceled=1`,
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: user.email }),
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      res.status(500).json({ error: "Failed to create checkout session" });
      return;
    }

    res.status(200).json({ url: session.url });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

billingRouter.post("/confirm", async (req, res) => {
  const parsed = confirmCheckoutBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      parsed.data.sessionId,
      { expand: ["subscription"] },
    );

    const userId = session.metadata?.userId ?? session.client_reference_id;
    if (!userId || userId !== req.user!.id) {
      res.status(403).json({ error: "Checkout session does not belong to you" });
      return;
    }

    if (session.status !== "complete") {
      res.status(400).json({ error: "Checkout is not complete yet" });
      return;
    }

    await handleCheckoutCompleted(session as unknown as CheckoutSession);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { plan: true, stripeSubscriptionId: true },
    });

    res.status(200).json({
      plan: user?.plan ?? "FREE",
      subscriptionStatus: user?.stripeSubscriptionId ? "active" : null,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

billingRouter.post("/sync", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const stripe = getStripe();
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      customerId = customers.data[0]?.id ?? null;
    }

    if (!customerId) {
      res.status(404).json({ error: "No Stripe customer found for this account" });
      return;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    const subscription =
      subscriptions.data.find((sub) =>
        ["active", "trialing", "past_due"].includes(sub.status),
      ) ?? subscriptions.data[0];

    if (!subscription) {
      if (user.plan !== "FREE") {
        await downgradeUserToFree(user.id);
      }
      res.status(200).json({ plan: "FREE", subscriptionStatus: null });
      return;
    }

    const plan = await syncUserPlanFromSubscription(
      user.id,
      subscription as unknown as Subscription,
    );

    res.status(200).json({
      plan,
      subscriptionStatus: subscription.status,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

billingRouter.post("/portal", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      res.status(400).json({ error: "No billing account found" });
      return;
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getFrontendUrl()}/settings/billing`,
    });

    res.status(200).json({ url: session.url });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export async function handleCheckoutCompleted(session: CheckoutSession) {
  const userId = session.metadata?.userId ?? session.client_reference_id;
  if (!userId) return;

  const stripe = getStripe();
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!session.subscription) {
    if (customerId) {
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }
    return;
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncUserPlanFromSubscription(
    userId,
    subscription as unknown as Subscription,
  );
}

async function resolveUserIdFromSubscription(
  subscription: Subscription,
): Promise<string | null> {
  if (subscription.metadata.userId) {
    return subscription.metadata.userId;
  }

  if (!subscription.customer) {
    return null;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  return findUserIdByStripeCustomerId(customerId);
}

async function handleSubscriptionUpdated(subscription: Subscription) {
  const userId = await resolveUserIdFromSubscription(subscription);
  if (!userId) return;

  if (subscription.status === "canceled") {
    await downgradeUserToFree(userId);
    return;
  }

  await syncUserPlanFromSubscription(userId, subscription);
}

async function handleSubscriptionDeleted(subscription: Subscription) {
  const userId = await resolveUserIdFromSubscription(subscription);
  if (!userId) return;

  await downgradeUserToFree(userId);
}

export async function billingWebhookHandler(req: Request, res: Response) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    res.status(500).json({ error: "Webhook secret is not configured" });
    return;
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || Array.isArray(signature)) {
    res.status(400).json({ error: "Missing Stripe signature" });
    return;
  }

  let event: StripeEvent;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret,
    ) as StripeEvent;
  } catch {
    res.status(400).json({ error: "Invalid webhook signature" });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as CheckoutSession);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Subscription);
        break;
      case "invoice.payment_failed":
        break;
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch {
    res.status(500).json({ error: "Webhook handler failed" });
  }
}
