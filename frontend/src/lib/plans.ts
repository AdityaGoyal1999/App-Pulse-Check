export type MarketingPlanId =
  | "FREE"
  | "SUPPORTER"
  | "ENTERPRISE"
  | "ENTERPRISE_PLUS";

export type MarketingPlan = {
  id: MarketingPlanId;
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  maxChecks: number;
  maxPingLogsPerCheck: number;
  available: boolean;
  highlighted?: boolean;
  features: string[];
};

export const MARKETING_PLANS: MarketingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    priceNote: "forever",
    description: "Everything you need to monitor a handful of cron jobs and scripts.",
    maxChecks: 20,
    maxPingLogsPerCheck: 100,
    available: true,
    highlighted: true,
    features: [
      "20 checks",
      "100 ping logs per check",
      "Slack down alerts",
      "Slack recovery alerts",
      "Alert deduplication",
      "Pause checks",
      "Web dashboard & ping history",
    ],
  },
  {
    id: "SUPPORTER",
    name: "Supporter",
    price: "$5",
    priceNote: "per month",
    description: "Same limits as Free — support ongoing development.",
    maxChecks: 20,
    maxPingLogsPerCheck: 100,
    available: true,
    features: [
      "Everything in Free",
      "Supporter badge",
      "Funds product development",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "$20",
    priceNote: "per month",
    description: "Higher limits and email alerts for growing teams.",
    maxChecks: 100,
    maxPingLogsPerCheck: 1000,
    available: false,
    features: [
      "100 checks",
      "1,000 ping logs per check",
      "Slack + email alerts",
      "Email support",
      "Everything in Free",
    ],
  },
  {
    id: "ENTERPRISE_PLUS",
    name: "Enterprise Plus",
    price: "$80",
    priceNote: "per month",
    description: "Maximum scale with SMS, phone, and shared workspaces.",
    maxChecks: 1000,
    maxPingLogsPerCheck: 1000,
    available: false,
    features: [
      "1,000 checks",
      "1,000 ping logs per check",
      "SMS & phone alert credits",
      "Shared team workspaces",
      "Priority email support",
      "Everything in Enterprise",
    ],
  },
];

export const PLAN_DIFFERENTIATORS = [
  {
    title: "Slack recovery alerts",
    description:
      "Get notified when a check comes back up — not just when it goes down.",
  },
  {
    title: "Alert deduplication",
    description:
      "One alert per outage. No spam while a check stays down.",
  },
  {
    title: "Pause checks",
    description:
      "Silence monitoring during planned maintenance without deleting checks.",
  },
] as const;

export function getMarketingPlan(id: MarketingPlanId): MarketingPlan {
  const plan = MARKETING_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}
