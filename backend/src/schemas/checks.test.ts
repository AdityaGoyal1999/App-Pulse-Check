import { describe, expect, it } from "vitest";
import { updateCheckNotificationsSchema } from "./checks";

const DISCORD_URL =
  "https://discord.com/api/webhooks/123456789012345678/AbCdEfGhIjKlMnOpQrStUvWxYz";
const SLACK_URL = "https://hooks.slack.com/services/T000/B000/XXXXXXXX";

describe("updateCheckNotificationsSchema", () => {
  it("accepts a valid Discord webhook URL", () => {
    const result = updateCheckNotificationsSchema.safeParse({
      alertDiscordWebhookUrl: DISCORD_URL,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.alertDiscordWebhookUrl).toBe(DISCORD_URL);
    }
  });

  it("accepts Discord-only configuration with Slack cleared", () => {
    const result = updateCheckNotificationsSchema.safeParse({
      alertWebhookUrl: null,
      alertDiscordWebhookUrl: DISCORD_URL,
    });

    expect(result.success).toBe(true);
  });

  it("accepts both Slack and Discord webhook URLs", () => {
    const result = updateCheckNotificationsSchema.safeParse({
      alertWebhookUrl: SLACK_URL,
      alertDiscordWebhookUrl: DISCORD_URL,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a Slack URL in the Discord field", () => {
    const result = updateCheckNotificationsSchema.safeParse({
      alertDiscordWebhookUrl: SLACK_URL,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a Discord URL in the Slack field", () => {
    const result = updateCheckNotificationsSchema.safeParse({
      alertWebhookUrl: DISCORD_URL,
    });

    expect(result.success).toBe(false);
  });

  it("requires at least one notification field in the request body", () => {
    const result = updateCheckNotificationsSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
