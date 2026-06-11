import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  createCheckSchema,
  updateCheckNotificationsSchema,
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
    const check = await prisma.check.create({
      data: {
        name: parsed.data.name,
        intervalSeconds: parsed.data.intervalSeconds,
        graceSeconds: parsed.data.graceSeconds,
        userId: req.user!.id,
      },
    });

    res.status(201).json(toCheckResponse(check));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

checksRouter.get("/", async (req, res) => {
  try {
    const checks = await prisma.check.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ checks: checks.map(toCheckResponse) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

const notificationSelect = {
  name: true,
  alertWebhookUrl: true,
  alertEmail: true,
} as const;

function toNotificationsResponse(check: {
  name: string;
  alertWebhookUrl: string | null;
  alertEmail: string | null;
}) {
  return {
    name: check.name,
    alertWebhookUrl: check.alertWebhookUrl,
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

  const data: { alertWebhookUrl?: string | null; alertEmail?: string | null } =
    {};

  if (parsed.data.alertWebhookUrl !== undefined) {
    data.alertWebhookUrl = parsed.data.alertWebhookUrl;
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
