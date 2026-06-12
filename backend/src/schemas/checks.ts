import { z } from "zod";

export const createCheckSchema = z.object({
  name: z.string().trim().min(1).max(100),
  intervalSeconds: z.number().int().min(60).max(86400),
  graceSeconds: z.number().int().min(0).max(3600),
});

export type CreateCheckBody = z.infer<typeof createCheckSchema>;

export const updateCheckNotificationsSchema = z
  .object({
    alertWebhookUrl: z.string().url().nullable().optional(),
    // alertEmail: z.string().email().nullable().optional(), // next ship
  })
  .refine((data) => data.alertWebhookUrl !== undefined, {
    message: "At least one field is required",
    path: [],
  });

export type UpdateCheckNotificationsBody = z.infer<
  typeof updateCheckNotificationsSchema
>;

export const updateCheckPausedSchema = z.object({
  paused: z.boolean(),
});

export type UpdateCheckPausedBody = z.infer<typeof updateCheckPausedSchema>;

