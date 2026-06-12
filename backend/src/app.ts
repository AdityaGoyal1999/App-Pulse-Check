import cors from "cors";
import express from "express";
import { prisma } from "./db";
import { authRouter } from "./routes/auth";
import { checksRouter } from "./routes/checks";
import { pingRouter } from "./routes/ping";
import { userRouter } from "./routes/user";

export const app = express();

const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3001";
app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// Ping endpoint
app.use("/ping", pingRouter);

app.use("/api/auth", authRouter);
app.use("/api/checks", checksRouter);
app.use("/api/user", userRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});
