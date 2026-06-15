const SLACK_WEBHOOK_HOST = "hooks.slack.com";
const DISCORD_WEBHOOK_HOSTS = new Set(["discord.com", "discordapp.com"]);

export function isSlackWebhookUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === SLACK_WEBHOOK_HOST;
  } catch {
    return false;
  }
}

export function isDiscordWebhookUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      DISCORD_WEBHOOK_HOSTS.has(url.hostname) &&
      url.pathname.startsWith("/api/webhooks/")
    );
  } catch {
    return false;
  }
}
