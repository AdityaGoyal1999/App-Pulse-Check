import { z } from "zod";

export const updateNotificationsSchema = z
  .object({
    alertWebhookUrl: z.string().url().nullable().optional(),
    // alertEmail: z.string().email().nullable().optional(), // next ship
  })
  .refine((data) => data.alertWebhookUrl !== undefined, {
    message: "At least one field is required",
    path: [],
  });

export type UpdateNotificationsBody = z.infer<typeof updateNotificationsSchema>;
