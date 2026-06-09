import { Router } from "express";
import { CheckStatus } from "../../generated/prisma/client";
import { prisma } from "../db";

export const pingRouter = Router();

pingRouter.get("/:uuid", async (req, res) => {
  const { uuid } = req.params;

  try {
    const check = await prisma.check.findUnique({
      where: { uuid },
    });

    if (!check) {
      res.status(404).json({ error: "Check not found" });
      return;
    }

    const pingedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.pingLog.create({
        data: { checkId: check.id, pingedAt },
      });
      await tx.check.update({
        where: { id: check.id },
        data: { status: CheckStatus.UP, lastPingedAt: pingedAt },
      });
    });

    res.status(200).json({ ok: true, checkId: check.id, pingedAt });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});
