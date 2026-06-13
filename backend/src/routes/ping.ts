import { Router } from "express";
import { CheckStatus } from "../../generated/prisma/client";
import { sendRecoveryAlert } from "../lib/alerts";
import { getUserLimits, trimExcessPingLogs } from "../lib/limits";
import { prisma } from "../db";

export const pingRouter = Router();

pingRouter.get("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  try {
    const check = await prisma.check.findUnique({
      where: { uuid },
      select: {
        id: true,
        userId: true,
        name: true,
        status: true,
        lastPingedAt: true,
        alertWebhookUrl: true,
        alertEmail: true,
      },
    });

    if (!check) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    const { limits } = await getUserLimits(check.userId);
    const pingedAt = new Date();
    const isRecovery = check.status === CheckStatus.DOWN;

    await prisma.$transaction(async (tx) => {
      await tx.pingLog.create({
        data: { checkId: check.id, pingedAt },
      });
      await tx.check.update({
        where: { id: check.id },
        data: {
          status: CheckStatus.UP,
          lastPingedAt: pingedAt,
          ...(isRecovery ? { alertSent: false } : {}),
        },
      });
      await trimExcessPingLogs(check.id, limits.maxPingLogsPerCheck, tx);
    });

    if (isRecovery) {
      void sendRecoveryAlert(
        { name: check.name, lastPingedAt: pingedAt },
        { alertWebhookUrl: check.alertWebhookUrl, alertEmail: check.alertEmail },
      );
    }

    res.status(200).json({ ok: true, checkId: check.id, pingedAt });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});
