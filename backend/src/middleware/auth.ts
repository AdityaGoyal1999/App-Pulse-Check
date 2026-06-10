import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}
