import { z } from "zod";

export const checkoutBodySchema = z.object({
  plan: z.enum(["SUPPORTER"]),
});

export const confirmCheckoutBodySchema = z.object({
  sessionId: z.string().min(1),
});
