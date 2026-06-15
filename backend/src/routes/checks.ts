import { Router } from "express";
import { prisma } from "../db";
import {
  assertCanCreateCheck,
  CheckLimitError,
  getUserLimits,
} from "../lib/limits";
import { requireAuth } from "../middleware/auth";
import {
  createCheckSchema,
  listChecksQuerySchema,
  updateCheckNotificationsSchema,
  updateCheckPausedSchema,
} from "../schemas/checks";

export const checksRouter = Router();

checksRouter.use(requireAuth);

function toCheckResponse(check: {
  id: string;
  uuid: string;
  name: string;
  intervalSeconds: number;
  graceSeconds: number;
  status: string;
  lastPingedAt: Date | null;
  paused: boolean;
  alertWebhookUrl: string | null;
  alertDiscordWebhookUrl: string | null;
  createdAt: Date;
}) {
  return {
    id: check.id,
    uuid: check.uuid,
    name: check.name,
    intervalSeconds: check.intervalSeconds,
    graceSeconds: check.graceSeconds,
    status: check.status,
    lastPingedAt: check.lastPingedAt,
    paused: check.paused,
    hasAlerts: Boolean(check.alertWebhookUrl || check.alertDiscordWebhookUrl),
    createdAt: check.createdAt,
  };
}

checksRouter.post("/", async (req, res) => {
  const parsed = createCheckSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    await assertCanCreateCheck(req.user!.id);

    const check = await prisma.check.create({
      data: {
        name: parsed.data.name,
        intervalSeconds: parsed.data.intervalSeconds,
        graceSeconds: parsed.data.graceSeconds,
        userId: req.user!.id,
      },
    });

    res.status(201).json(toCheckResponse(check));
  } catch (err) {
    if (err instanceof CheckLimitError) {
      res.status(403).json({
        error: "Check limit reached",
        limit: err.limit,
        plan: err.plan,
        checkCount: err.checkCount,
      });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

checksRouter.get("/", async (req, res) => {
  const parsed = listChecksQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const q = parsed.data.q?.trim();
  const where = {
    userId: req.user!.id,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  try {
    const [checks, total] = await Promise.all([
      prisma.check.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.check.count({ where }),
    ]);

    res.status(200).json({
      checks: checks.map(toCheckResponse),
      total,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

const settingsSelect = {
  id: true,
  uuid: true,
  name: true,
  intervalSeconds: true,
  graceSeconds: true,
  status: true,
  lastPingedAt: true,
  paused: true,
  alertWebhookUrl: true,
  alertDiscordWebhookUrl: true,
  alertEmail: true,
} as const;

function toSettingsResponse(check: {
  id: string;
  uuid: string;
  name: string;
  intervalSeconds: number;
  graceSeconds: number;
  status: string;
  lastPingedAt: Date | null;
  paused: boolean;
  alertWebhookUrl: string | null;
  alertDiscordWebhookUrl: string | null;
  alertEmail: string | null;
}) {
  return {
    id: check.id,
    uuid: check.uuid,
    name: check.name,
    intervalSeconds: check.intervalSeconds,
    graceSeconds: check.graceSeconds,
    status: check.status,
    lastPingedAt: check.lastPingedAt,
    paused: check.paused,
    alertWebhookUrl: check.alertWebhookUrl,
    alertDiscordWebhookUrl: check.alertDiscordWebhookUrl,
    alertEmail: check.alertEmail,
  };
}

checksRouter.get("/:id", async (req, res) => {
  const checkId = req.params.id;

  try {
    const check = await prisma.check.findFirst({
      where: { id: checkId, userId: req.user!.id },
      select: settingsSelect,
    });

    if (!check) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    res.status(200).json(toSettingsResponse(check));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

const notificationSelect = {
  name: true,
  alertWebhookUrl: true,
  alertDiscordWebhookUrl: true,
  alertEmail: true,
} as const;

function toNotificationsResponse(check: {
  name: string;
  alertWebhookUrl: string | null;
  alertDiscordWebhookUrl: string | null;
  alertEmail: string | null;
}) {
  return {
    name: check.name,
    alertWebhookUrl: check.alertWebhookUrl,
    alertDiscordWebhookUrl: check.alertDiscordWebhookUrl,
    alertEmail: check.alertEmail,
  };
}

checksRouter.get("/:id/notifications", async (req, res) => {
  const checkId = req.params.id;

  try {
    const check = await prisma.check.findFirst({
      where: { id: checkId, userId: req.user!.id },
      select: notificationSelect,
    });

    if (!check) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    res.status(200).json(toNotificationsResponse(check));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

const MAX_PING_LOGS_QUERY = 1000;

function parsePingLogsLimit(raw: unknown): number | null {
  if (raw === undefined) return 100;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_PING_LOGS_QUERY) {
    return null;
  }

  return parsed;
}

checksRouter.get("/:id/ping-logs", async (req, res) => {
  const checkId = req.params.id;
  const requestedLimit = parsePingLogsLimit(req.query.limit);

  if (requestedLimit === null) {
    res.status(400).json({ error: "Invalid limit" });
    return;
  }

  try {
    const check = await prisma.check.findFirst({
      where: { id: checkId, userId: req.user!.id },
      select: { id: true },
    });

    if (!check) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    const { limits } = await getUserLimits(req.user!.id);
    const effectiveLimit = Math.min(
      requestedLimit,
      limits.maxPingLogsPerCheck,
    );

    const logs = await prisma.pingLog.findMany({
      where: { checkId: check.id },
      orderBy: { pingedAt: "desc" },
      take: effectiveLimit,
      select: { id: true, pingedAt: true },
    });

    res.status(200).json({
      logs,
      limit: effectiveLimit,
      retentionLimit: limits.maxPingLogsPerCheck,
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

checksRouter.patch("/:id/paused", async (req, res) => {
  const checkId = req.params.id;
  const parsed = updateCheckPausedSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const existing = await prisma.check.findFirst({
      where: { id: checkId, userId: req.user!.id },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    const check = await prisma.check.update({
      where: { id: existing.id },
      data: { paused: parsed.data.paused },
    });

    res.status(200).json(toCheckResponse(check));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

checksRouter.patch("/:id/notifications", async (req, res) => {
  const checkId = req.params.id;
  const parsed = updateCheckNotificationsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      details: parsed.error.flatten(),
    });
    return;
  }

  const data: {
    alertWebhookUrl?: string | null;
    alertDiscordWebhookUrl?: string | null;
    alertEmail?: string | null;
  } = {};

  if (parsed.data.alertWebhookUrl !== undefined) {
    data.alertWebhookUrl = parsed.data.alertWebhookUrl;
  }

  if (parsed.data.alertDiscordWebhookUrl !== undefined) {
    data.alertDiscordWebhookUrl = parsed.data.alertDiscordWebhookUrl;
  }

  // if (parsed.data.alertEmail !== undefined) {
  //   data.alertEmail = parsed.data.alertEmail;
  // }

  try {
    const existing = await prisma.check.findFirst({
      where: { id: checkId, userId: req.user!.id },
      select: { id: true },
    });

    if (!existing) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    const check = await prisma.check.update({
      where: { id: existing.id },
      data,
      select: notificationSelect,
    });

    res.status(200).json(toNotificationsResponse(check));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

checksRouter.delete("/:id", async (req, res) => {
  const checkId = req.params.id;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const check = await tx.check.findFirst({
        where: { id: checkId, userId: req.user!.id },
      });
      if (!check) return null;

      await tx.pingLog.deleteMany({ where: { checkId: check.id } });
      await tx.check.delete({ where: { id: check.id } });
      return check;
    });

    if (!deleted) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});
