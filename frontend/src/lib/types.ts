export type User = { id: string; email: string };
export type AuthResponse = { token: string; user: User };
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
export type CreateCheckInput = {
  name: string;
  intervalSeconds: number;
  graceSeconds: number;
};
export type CheckNotificationSettings = {
  name: string;
  alertWebhookUrl: string | null;
  alertEmail: string | null;
};
