import { Resend } from "resend";

type AlertCheck = {
  name: string;
  lastPingedAt: Date | null;
};

type AlertUser = {
  alertWebhookUrl: string | null;
  alertEmail: string | null;
};

let resendClient: Resend | null = null;

function getResendClient(apiKey: string): Resend {
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function dashboardUrl(): string {
  const base = process.env.APP_URL ?? "http://localhost:3001";
  return `${base.replace(/\/$/, "")}/dashboard`;
}

function buildDownAlertMessage(check: AlertCheck): {
  subject: string;
  text: string;
  html: string;
} {
  const lastPing = check.lastPingedAt?.toISOString() ?? "never";
  const link = dashboardUrl();

  const text = [
    `🔴 Check DOWN: ${check.name}`,
    `Last ping: ${lastPing}`,
    `Dashboard: ${link}`,
  ].join("\n");

  const html = [
    `<p><strong>🔴 Check DOWN:</strong> ${check.name}</p>`,
    `<p>Last ping: ${lastPing}</p>`,
    `<p><a href="${link}">Open dashboard</a></p>`,
  ].join("\n");

  return {
    subject: `Check DOWN: ${check.name}`,
    text,
    html,
  };
}

async function sendSlackAlert(webhookUrl: string, text: string): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error(
        `Slack alert failed: HTTP ${response.status} ${response.statusText}`,
      );
    }
  } catch (err) {
    console.error("Slack alert failed:", err);
  }
}

async function sendEmailAlert(
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping email alert");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    console.warn("RESEND_FROM_EMAIL not set; skipping email alert");
    return;
  }

  try {
    const resend = getResendClient(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, text, html });

    if (error) {
      console.error("Email alert failed:", error.message);
    }
  } catch (err) {
    console.error("Email alert failed:", err);
  }
}

export async function sendDownAlert(
  check: AlertCheck,
  user: AlertUser,
): Promise<void> {
  if (!user.alertWebhookUrl && !user.alertEmail) {
    return;
  }

  const { subject, text, html } = buildDownAlertMessage(check);

  const tasks: Promise<void>[] = [];

  if (user.alertWebhookUrl) {
    tasks.push(sendSlackAlert(user.alertWebhookUrl, text));
  }

  if (user.alertEmail) {
    tasks.push(sendEmailAlert(user.alertEmail, subject, text, html));
  }

  await Promise.allSettled(tasks);
}
