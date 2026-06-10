import { Router } from "express";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../db";
import { signToken } from "../lib/jwt";
import { hashPassword, verifyPassword } from "../lib/password";
import { loginBodySchema, signupBodySchema } from "../schemas/auth";

export const authRouter = Router();

authRouter.post("/signup", async (req, res) => {
  const parsed = signupBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });

    const token = signToken({ userId: user.id });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken({ userId: user.id });
    res.status(200).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stateless JWT logout is client-side for MVP — server returns ok; client deletes the stored token.
authRouter.post("/logout", (_req, res) => {
  res.status(200).json({ ok: true });
});
