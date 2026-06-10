import { z } from "zod";

export const authBodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8),
});

export const signupBodySchema = authBodySchema;
export const loginBodySchema = authBodySchema;

export type AuthBody = z.infer<typeof authBodySchema>;
