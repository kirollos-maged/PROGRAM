import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

type NotificationType = "course_update" | "assignment_reminder" | "quiz_deadline";
type NotificationChannel = "email" | "in_app";

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const router = Router();

const notifications: Notification[] = [];

const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum(["course_update", "assignment_reminder", "quiz_deadline"]),
  channel: z.enum(["email", "in_app"]),
  title: z.string(),
  body: z.string()
});

router.post("/", (req, res) => {
  const parsed = createNotificationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const n: Notification = {
    id: uuid(),
    ...parsed.data,
    read: false,
    createdAt: now
  };
  notifications.push(n);
  res.status(201).json(n);
});

router.get("/user/:userId", (req, res) => {
  const items = notifications.filter((n) => n.userId === req.params.userId);
  res.json(items);
});

router.post("/:id/read", (req, res) => {
  const n = notifications.find((x) => x.id === req.params.id);
  if (!n) {
    return res.status(404).json({ error: "Notification not found" });
  }
  n.read = true;
  res.json(n);
});

export const notificationsRouter = router;

