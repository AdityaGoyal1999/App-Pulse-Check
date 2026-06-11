export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_REQUIREMENTS = [
  {
    id: "min-length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password: string) => password.length >= PASSWORD_MIN_LENGTH,
  },
] as const;

export type AuthFieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function validateAuthForm(email: string, password: string) {
  const trimmed = email.trim().toLowerCase();
  const errors: AuthFieldErrors = {};

  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    errors.email = "Enter a valid email address";
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }

  return { trimmed, errors, valid: Object.keys(errors).length === 0 };
}

export function validateSignupForm(
  email: string,
  password: string,
  confirmPassword: string,
) {
  const result = validateAuthForm(email, password);

  if (password !== confirmPassword) {
    result.errors.confirmPassword = "Passwords do not match";
    result.valid = false;
  }

  return result;
}

export type CreateCheckFieldErrors = {
  name?: string;
  intervalSeconds?: string;
  graceSeconds?: string;
};

function parsePositiveInt(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n)) return null;
  return n;
}

export function validateCreateCheckForm(
  name: string,
  intervalSeconds: string,
  graceSeconds: string,
) {
  const trimmedName = name.trim();
  const errors: CreateCheckFieldErrors = {};

  if (!trimmedName || trimmedName.length > 100) {
    errors.name = "Name must be 1–100 characters";
  }

  const interval = parsePositiveInt(intervalSeconds);
  if (interval === null || interval < 60 || interval > 86400) {
    errors.intervalSeconds = "Interval must be an integer between 60 and 86400";
  }

  const grace = parsePositiveInt(graceSeconds);
  if (grace === null || grace < 0 || grace > 3600) {
    errors.graceSeconds =
      "Grace period must be an integer between 0 and 3600";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    values: valid
      ? {
          name: trimmedName,
          intervalSeconds: interval!,
          graceSeconds: grace!,
        }
      : null,
    errors,
    valid,
  };
}

export type NotificationFieldErrors = {
  alertWebhookUrl?: string;
  alertEmail?: string;
  form?: string;
};

export function validateNotificationForm(
  alertWebhookUrl: string,
  alertEmail: string,
) {
  const trimmedWebhook = alertWebhookUrl.trim();
  const trimmedEmail = alertEmail.trim().toLowerCase();
  const errors: NotificationFieldErrors = {};

  const webhookValue = trimmedWebhook || null;
  const emailValue = trimmedEmail || null;

  if (webhookValue) {
    try {
      new URL(webhookValue);
    } catch {
      errors.alertWebhookUrl = "Enter a valid URL";
    }
  }

  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    errors.alertEmail = "Enter a valid email address";
  }

  if (!webhookValue && !emailValue) {
    errors.form = "Enter at least a Slack webhook URL or alert email";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    values: valid
      ? { alertWebhookUrl: webhookValue, alertEmail: emailValue }
      : null,
    errors,
    valid,
  };
}
