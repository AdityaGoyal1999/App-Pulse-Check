import Stripe from "stripe";

let stripeClient: ReturnType<typeof Stripe> | null = null;

export function getStripe(): ReturnType<typeof Stripe> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return stripeClient;
}

export function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? "http://localhost:3001";
}
