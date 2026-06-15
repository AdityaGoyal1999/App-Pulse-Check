import { z } from "zod";
import { isDiscordWebhookUrl, isSlackWebhookUrl } from "../lib/webhook-urls";

export const createCheckSchema = z.object({
  name: z.string().trim().min(1).max(100),
  intervalSeconds: z.number().int().min(60).max(86400),
  graceSeconds: z.number().int().min(0).max(3600),
});

export type CreateCheckBody = z.infer<typeof createCheckSchema>;

const slackWebhookSchema = z
  .string()
  .url()
  .nullable()
  .refine((value) => value === null || isSlackWebhookUrl(value), {
    message: "Enter a valid Slack incoming webhook URL",
  });

const discordWebhookSchema = z
  .string()
  .url()
  .nullable()
  .refine((value) => value === null || isDiscordWebhookUrl(value), {
    message: "Enter a valid Discord webhook URL",
  });

export const updateCheckNotificationsSchema = z
  .object({
    alertWebhookUrl: slackWebhookSchema.optional(),
    alertDiscordWebhookUrl: discordWebhookSchema.optional(),
    // alertEmail: z.string().email().nullable().optional(), // next ship
  })
  .refine(
    (data) =>
      data.alertWebhookUrl !== undefined ||
      data.alertDiscordWebhookUrl !== undefined,
    {
      message: "At least one field is required",
      path: [],
    },
  );

export type UpdateCheckNotificationsBody = z.infer<
  typeof updateCheckNotificationsSchema
>;

export const updateCheckPausedSchema = z.object({
  paused: z.boolean(),
});

export type UpdateCheckPausedBody = z.infer<typeof updateCheckPausedSchema>;

export const listChecksQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
});

export type ListChecksQuery = z.infer<typeof listChecksQuerySchema>;

