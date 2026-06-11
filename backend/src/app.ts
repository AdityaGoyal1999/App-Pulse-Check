import express from "express";
import { authRouter } from "./routes/auth";
import { checksRouter } from "./routes/checks";
import { pingRouter } from "./routes/ping";

export const app = express();

app.use(express.json());

// Check if this server is running
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Ping endpoint
app.use("/ping", pingRouter);

app.use("/api/auth", authRouter);
app.use("/api/checks", checksRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});
