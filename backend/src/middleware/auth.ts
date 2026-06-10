import type { NextFunction, Request, Response } from "express";

// Step 3c: parse "Authorization: Bearer <token>", verifyToken,
// attach req.user = { id: userId }, else 401 { error: "Unauthorized" }
export function requireAuth(
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  res.status(501).json({ error: "requireAuth not implemented yet" });
}
