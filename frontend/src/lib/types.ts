export type User = { id: string; email: string };
export type AuthResponse = { token: string; user: User };
export type Plan = "FREE" | "SUPPORTER" | "ENTERPRISE" | "ENTERPRISE_PLUS";
export type PlanLimits = {
  maxChecks: number;
  maxPingLogsPerCheck: number;
};
export type UserMe = {
  id: string;
  email: string;
  plan: Plan;
  checkCount: number;
  limits: PlanLimits;
};
export type BillingStatus = {
  plan: Plan;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};
export type CheckoutSessionResponse = { url: string };
export type PortalSessionResponse = { url: string };
export type CheckLimitErrorResponse = {
  error: "Check limit reached";
  limit: number;
  plan: Plan;
  checkCount: number;
};
export type CheckStatus = "NEW" | "UP" | "DOWN";
export type Check = {
  id: string;
  uuid: string;
  name: string;
  intervalSeconds: number;
  graceSeconds: number;
  status: CheckStatus;
  lastPingedAt: string | null;
  paused: boolean;
  hasAlerts: boolean;
  createdAt: string;
};
export type ChecksListResponse = {
  checks: Check[];
  total: number;
};
export type CreateCheckInput = {
  name: string;
  intervalSeconds: number;
  graceSeconds: number;
};
export type CheckNotificationSettings = {
  name: string;
  alertWebhookUrl: string | null;
  alertDiscordWebhookUrl: string | null;
  alertEmail: string | null;
};
export type CheckSettings = {
  id: string;
  uuid: string;
  name: string;
  intervalSeconds: number;
  graceSeconds: number;
  status: CheckStatus;
  lastPingedAt: string | null;
  paused: boolean;
  alertWebhookUrl: string | null;
  alertDiscordWebhookUrl: string | null;
  alertEmail: string | null;
};
export type PingLogEntry = { id: string; pingedAt: string };
export type PingLogsResponse = {
  logs: PingLogEntry[];
  limit: number;
  retentionLimit: number;
};
