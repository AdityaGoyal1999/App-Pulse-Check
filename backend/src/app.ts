import express from "express";
import { pingRouter } from "./routes/ping";

export const app = express();

// Check if this server is running
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Ping endpoint
app.use("/ping", pingRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});
