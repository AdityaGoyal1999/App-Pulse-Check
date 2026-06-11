// import { Resend } from "resend";

type AlertCheck = {
  name: string;
  lastPingedAt: Date | null;
};

type AlertUser = {
  alertWebhookUrl: string | null;
  alertEmail: string | null;
};

type DownAlertContent = {
  subject: string;
  text: string;
  html: string;
  slackPayload: Record<string, unknown>;
};

// let resendClient: Resend | null = null;
//
// function getResendClient(apiKey: string): Resend {
//   if (!resendClient) {
//     resendClient = new Resend(apiKey);
//   }
//   return resendClient;
// }

function appName(): string {
  return process.env.APP_NAME ?? "AppPulseCheck";
}

function dashboardUrl(): string {
  const base = process.env.APP_URL ?? "http://localhost:3001";
  return `${base.replace(/\/$/, "")}/dashboard`;
}

// Email alerts disabled until verified domain (next ship):
// function extractEmailAddress(value: string): string {
//   const angleMatch = value.match(/<([^>]+)>/);
//   return (angleMatch?.[1] ?? value).trim();
// }
//
// function isValidEmailAddress(value: string): boolean {
//   return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
// }
//
// function resolveFromEmail(): string | null {
//   const raw = process.env.RESEND_FROM_EMAIL?.trim();
//   if (!raw) {
//     return null;
//   }
//
//   const address = extractEmailAddress(raw);
//   if (!isValidEmailAddress(address)) {
//     console.error(
//       `RESEND_FROM_EMAIL is invalid (${JSON.stringify(raw)}). ` +
//         'Use a full address like "AppPulseCheck <you@example.com>".',
//     );
//     return null;
//   }
//
//   return raw;
// }
//
// function resolveReplyToEmail(): string | undefined {
//   const raw = process.env.RESEND_REPLY_TO_EMAIL?.trim();
//   if (!raw) {
//     return undefined;
//   }
//
//   if (!isValidEmailAddress(raw)) {
//     console.warn(
//       `RESEND_REPLY_TO_EMAIL is invalid (${JSON.stringify(raw)}); ignoring reply-to.`,
//     );
//     return undefined;
//   }
//
//   return raw;
// }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatLastPing(lastPingedAt: Date | null): string {
  if (!lastPingedAt) {
    return "Never received";
  }

  return lastPingedAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";
}

function buildDownAlertMessage(check: AlertCheck): DownAlertContent {
  const lastPing = formatLastPing(check.lastPingedAt);
  const link = dashboardUrl();
  const name = appName();
  const safeCheckName = escapeHtml(check.name);

  const text = [
    `Check DOWN: ${check.name}`,
    `Last ping: ${lastPing}`,
    `Open dashboard: ${link}`,
    "",
    `— ${name}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check DOWN: ${safeCheckName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
          <tr>
            <td style="background-color:#dc2626;padding:20px 28px;">
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#fecaca;">Alert</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;line-height:1.3;color:#ffffff;">Check is DOWN</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#52525b;">
                One of your monitored checks missed its expected ping window.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border:1px solid #e4e4e7;border-radius:8px;">
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid #e4e4e7;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#71717a;">Check</p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#18181b;">${safeCheckName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;color:#71717a;">Last ping</p>
                    <p style="margin:0;font-size:15px;color:#18181b;">${escapeHtml(lastPing)}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td style="border-radius:8px;background-color:#18181b;">
                    <a href="${link}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Open dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;border-top:1px solid #e4e4e7;background-color:#fafafa;">
              <p style="margin:0;font-size:12px;line-height:1.5;color:#a1a1aa;text-align:center;">
                Sent by ${escapeHtml(name)} · <a href="${link}" style="color:#71717a;text-decoration:underline;">Manage alerts</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const slackPayload = {
    text: `Check DOWN: ${check.name}`,
    attachments: [
      {
        color: "#DC2626",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Check is DOWN",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${check.name}* missed its expected ping window.`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Check*\n${check.name}`,
              },
              {
                type: "mrkdwn",
                text: `*Last ping*\n${lastPing}`,
              },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Open dashboard",
                  emoji: true,
                },
                url: link,
                style: "danger",
              },
            ],
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Sent by *${name}*`,
              },
            ],
          },
        ],
      },
    ],
  };

  return {
    subject: `Check DOWN: ${check.name}`,
    text,
    html,
    slackPayload,
  };
}

async function sendSlackAlert(
  webhookUrl: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

// Email alerts disabled until verified domain (next ship):
// async function sendEmailAlert(
//   to: string,
//   subject: string,
//   text: string,
//   html: string,
// ): Promise<void> {
//   const apiKey = process.env.RESEND_API_KEY;
//   if (!apiKey) {
//     console.warn("RESEND_API_KEY not set; skipping email alert");
//     return;
//   }
//
//   const from = resolveFromEmail();
//   if (!from) {
//     if (!process.env.RESEND_FROM_EMAIL) {
//       console.warn("RESEND_FROM_EMAIL not set; skipping email alert");
//     }
//     return;
//   }
//
//   const replyTo = resolveReplyToEmail();
//
//   try {
//     const resend = getResendClient(apiKey);
//     const { error } = await resend.emails.send({
//       from,
//       to,
//       subject,
//       text,
//       html,
//       ...(replyTo ? { replyTo } : {}),
//     });
//
//     if (error) {
//       console.error("Email alert failed:", error.message);
//     }
//   } catch (err) {
//     console.error("Email alert failed:", err);
//   }
// }

export async function sendDownAlert(
  check: AlertCheck,
  user: AlertUser,
): Promise<void> {
  if (!user.alertWebhookUrl) {
    return;
  }

  const { slackPayload } = buildDownAlertMessage(check);

  const tasks: Promise<void>[] = [];

  if (user.alertWebhookUrl) {
    tasks.push(sendSlackAlert(user.alertWebhookUrl, slackPayload));
  }

  // if (user.alertEmail) {
  //   tasks.push(sendEmailAlert(user.alertEmail, subject, text, html));
  // }

  await Promise.allSettled(tasks);
}
