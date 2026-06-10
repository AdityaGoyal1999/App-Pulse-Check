import { z } from "zod";

export const createCheckSchema = z.object({
  name: z.string().trim().min(1).max(100),
  intervalSeconds: z.number().int().min(60).max(86400),
  graceSeconds: z.number().int().min(0).max(3600),
});

export type CreateCheckBody = z.infer<typeof createCheckSchema>;

