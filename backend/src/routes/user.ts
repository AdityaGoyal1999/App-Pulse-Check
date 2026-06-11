import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { updateNotificationsSchema } from "../schemas/user";

export const userRouter = Router();

userRouter.use(requireAuth);

const notificationSelect = {
  alertWebhookUrl: true,
  alertEmail: true,
} as const;

function toNotificationsResponse(user: {
  alertWebhookUrl: string | null;
  alertEmail: string | null;
}) {
  return {
    alertWebhookUrl: user.alertWebhookUrl,
    alertEmail: user.alertEmail,
  };
}

userRouter.get("/notifications", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: notificationSelect,
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(toNotificationsResponse(user));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

userRouter.patch("/notifications", async (req, res) => {
  const parsed = updateNotificationsSchema.safeParse(req.body);
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
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: notificationSelect,
    });

    res.status(200).json(toNotificationsResponse(user));
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});
