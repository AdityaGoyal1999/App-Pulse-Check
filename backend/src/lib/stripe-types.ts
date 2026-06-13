export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete_expired"
  | "incomplete"
  | "paused";

export type StripeCustomerRef =
  | string
  | { id: string; deleted?: boolean }
  | null;

export type Subscription = {
  id: string;
  status: SubscriptionStatus;
  customer: StripeCustomerRef;
  items: {
    data: Array<{
      current_period_end?: number;
      price: { id: string };
    }>;
  };
  metadata: Record<string, string>;
};

export type CheckoutSession = {
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
  customer?: StripeCustomerRef;
  subscription?: string | { id: string } | null;
};

export type StripeEvent = {
  type: string;
  data: { object: unknown };
};
