import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

import { sendDownAlert, sendRecoveryAlert } from "./alerts";

const DISCORD_URL =
  "https://discord.com/api/webhooks/123456789012345678/AbCdEfGhIjKlMnOpQrStUvWxYz";
const SLACK_URL = "https://hooks.slack.com/services/T000/B000/XXXXXXXX";

const check = {
  name: "Nightly backup",
  lastPingedAt: new Date("2026-06-15T12:00:00.000Z"),
};

function mockFetchOk() {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
  });
}

function getFetchBodies(): unknown[] {
  return fetchMock.mock.calls.map(([, init]) =>
    JSON.parse(String(init?.body)),
  );
}

function getFetchUrls(): string[] {
  return fetchMock.mock.calls.map(([url]) => String(url));
}

describe("sendDownAlert", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockFetchOk();
    process.env.APP_NAME = "AppPulseCheck";
    process.env.APP_URL = "http://localhost:3001";
  });

  afterEach(() => {
    delete process.env.APP_NAME;
    delete process.env.APP_URL;
  });

  it("does nothing when no webhook URLs are configured", async () => {
    await sendDownAlert(check, {
      alertWebhookUrl: null,
      alertDiscordWebhookUrl: null,
      alertEmail: null,
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a Discord embed payload when only Discord is configured", async () => {
    await sendDownAlert(check, {
      alertWebhookUrl: null,
      alertDiscordWebhookUrl: DISCORD_URL,
      alertEmail: null,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getFetchUrls()).toEqual([DISCORD_URL]);

    const body = getFetchBodies()[0] as {
      embeds: Array<{ title: string; color: number; description: string }>;
    };
    expect(body.embeds).toHaveLength(1);
    expect(body.embeds[0]?.title).toBe("Check is DOWN");
    expect(body.embeds[0]?.color).toBe(0xdc2626);
    expect(body.embeds[0]?.description).toContain("Nightly backup");
  });

  it("sends Slack and Discord payloads when both are configured", async () => {
    await sendDownAlert(check, {
      alertWebhookUrl: SLACK_URL,
      alertDiscordWebhookUrl: DISCORD_URL,
      alertEmail: null,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getFetchUrls()).toEqual(
      expect.arrayContaining([SLACK_URL, DISCORD_URL]),
    );

    const bodies = getFetchBodies();
    expect(bodies.some((body) => "attachments" in (body as object))).toBe(true);
    expect(
      bodies.some(
        (body) =>
          "embeds" in (body as object) &&
          (body as { embeds: Array<{ title: string }> }).embeds[0]?.title ===
            "Check is DOWN",
      ),
    ).toBe(true);
  });
});

describe("sendRecoveryAlert", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    mockFetchOk();
    process.env.APP_NAME = "AppPulseCheck";
    process.env.APP_URL = "http://localhost:3001";
  });

  afterEach(() => {
    delete process.env.APP_NAME;
    delete process.env.APP_URL;
  });

  it("sends a Discord recovery embed when Discord is configured", async () => {
    await sendRecoveryAlert(check, {
      alertWebhookUrl: null,
      alertDiscordWebhookUrl: DISCORD_URL,
      alertEmail: null,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getFetchUrls()).toEqual([DISCORD_URL]);

    const body = getFetchBodies()[0] as {
      embeds: Array<{ title: string; color: number; description: string }>;
    };
    expect(body.embeds[0]?.title).toBe("Check is UP");
    expect(body.embeds[0]?.color).toBe(0x16a34a);
    expect(body.embeds[0]?.description).toContain("received a ping again");
  });
});
