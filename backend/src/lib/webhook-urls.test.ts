import { describe, expect, it } from "vitest";
import { isDiscordWebhookUrl, isSlackWebhookUrl } from "./webhook-urls";

describe("isSlackWebhookUrl", () => {
  it("accepts a valid Slack incoming webhook URL", () => {
    expect(
      isSlackWebhookUrl(
        "https://hooks.slack.com/services/T000/B000/XXXXXXXX",
      ),
    ).toBe(true);
  });

  it("rejects Discord webhook URLs", () => {
    expect(
      isSlackWebhookUrl(
        "https://discord.com/api/webhooks/123456789/abcdef",
      ),
    ).toBe(false);
  });

  it("rejects non-HTTPS URLs", () => {
    expect(
      isSlackWebhookUrl(
        "http://hooks.slack.com/services/T000/B000/XXXXXXXX",
      ),
    ).toBe(false);
  });
});

describe("isDiscordWebhookUrl", () => {
  it("accepts discord.com webhook URLs", () => {
    expect(
      isDiscordWebhookUrl(
        "https://discord.com/api/webhooks/123456789012345678/AbCdEfGhIjKlMnOpQrStUvWxYz",
      ),
    ).toBe(true);
  });

  it("accepts discordapp.com webhook URLs", () => {
    expect(
      isDiscordWebhookUrl(
        "https://discordapp.com/api/webhooks/123456789012345678/AbCdEfGhIjKlMnOpQrStUvWxYz",
      ),
    ).toBe(true);
  });

  it("rejects Slack webhook URLs", () => {
    expect(
      isDiscordWebhookUrl(
        "https://hooks.slack.com/services/T000/B000/XXXXXXXX",
      ),
    ).toBe(false);
  });

  it("rejects Discord URLs without the webhooks path", () => {
    expect(isDiscordWebhookUrl("https://discord.com/channels/123/456")).toBe(
      false,
    );
  });

  it("rejects non-HTTPS URLs", () => {
    expect(
      isDiscordWebhookUrl(
        "http://discord.com/api/webhooks/123456789/abcdef",
      ),
    ).toBe(false);
  });
});
