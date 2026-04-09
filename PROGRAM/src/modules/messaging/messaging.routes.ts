import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

interface MessageThread {
  id: string;
  participants: string[]; // userIds
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  threadId: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const router = Router();

const threads: MessageThread[] = [];
const messages: Message[] = [];

const createThreadSchema = z.object({
  userAId: z.string(),
  userBId: z.string()
});

const sendMessageSchema = z.object({
  threadId: z.string(),
  fromUserId: z.string(),
  toUserId: z.string(),
  body: z.string()
});

router.post("/threads", (req, res) => {
  const parsed = createThreadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const existing = threads.find(
    (t) =>
      t.participants.includes(parsed.data.userAId) &&
      t.participants.includes(parsed.data.userBId)
  );
  if (existing) {
    return res.json(existing);
  }
  const thread: MessageThread = {
    id: uuid(),
    participants: [parsed.data.userAId, parsed.data.userBId],
    createdAt: now,
    updatedAt: now
  };
  threads.push(thread);
  res.status(201).json(thread);
});

router.get("/threads/:userId", (req, res) => {
  const userThreads = threads.filter((t) => t.participants.includes(req.params.userId));
  res.json(userThreads);
});

router.post("/messages", (req, res) => {
  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const thread = threads.find((t) => t.id === parsed.data.threadId);
  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }
  const now = new Date().toISOString();
  const message: Message = {
    id: uuid(),
    threadId: parsed.data.threadId,
    fromUserId: parsed.data.fromUserId,
    toUserId: parsed.data.toUserId,
    body: parsed.data.body,
    read: false,
    createdAt: now
  };
  messages.push(message);
  thread.updatedAt = now;
  res.status(201).json(message);
});

router.get("/threads/:threadId/messages", (req, res) => {
  const threadMessages = messages.filter((m) => m.threadId === req.params.threadId);
  res.json(threadMessages);
});

router.post("/messages/:id/read", (req, res) => {
  const m = messages.find((x) => x.id === req.params.id);
  if (!m) {
    return res.status(404).json({ error: "Message not found" });
  }
  m.read = true;
  res.json(m);
});

router.get("/inbox/:userId", (req, res) => {
  const inbox = messages.filter((m) => m.toUserId === req.params.userId);
  res.json(inbox);
});

router.get("/sent/:userId", (req, res) => {
  const sent = messages.filter((m) => m.fromUserId === req.params.userId);
  res.json(sent);
});

export const messagingRouter = router;

