import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

interface Discussion {
  id: string;
  courseId: string;
  title: string;
  createdByUserId: string;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
}

interface DiscussionReply {
  id: string;
  discussionId: string;
  parentReplyId?: string;
  body: string;
  createdByUserId: string;
  createdAt: string;
}

const router = Router();

const discussions: Discussion[] = [];
const replies: DiscussionReply[] = [];

const createDiscussionSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  createdByUserId: z.string()
});

const replySchema = z.object({
  body: z.string(),
  createdByUserId: z.string(),
  parentReplyId: z.string().optional()
});

router.post("/", (req, res) => {
  const parsed = createDiscussionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const d: Discussion = {
    id: uuid(),
    ...parsed.data,
    pinned: false,
    locked: false,
    createdAt: now
  };
  discussions.push(d);
  res.status(201).json(d);
});

router.get("/course/:courseId", (req, res) => {
  const courseDiscussions = discussions
    .filter((d) => d.courseId === req.params.courseId)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  res.json(courseDiscussions);
});

router.post("/:id/replies", (req, res) => {
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const discussion = discussions.find((d) => d.id === req.params.id);
  if (!discussion) {
    return res.status(404).json({ error: "Discussion not found" });
  }
  if (discussion.locked) {
    return res.status(400).json({ error: "Discussion is locked" });
  }
  const now = new Date().toISOString();
  const r: DiscussionReply = {
    id: uuid(),
    discussionId: discussion.id,
    parentReplyId: parsed.data.parentReplyId,
    body: parsed.data.body,
    createdByUserId: parsed.data.createdByUserId,
    createdAt: now
  };
  replies.push(r);
  res.status(201).json(r);
});

router.get("/:id/replies", (req, res) => {
  const discussionReplies = replies.filter((r) => r.discussionId === req.params.id);
  res.json(discussionReplies);
});

router.post("/:id/pin", (req, res) => {
  const d = discussions.find((x) => x.id === req.params.id);
  if (!d) {
    return res.status(404).json({ error: "Discussion not found" });
  }
  d.pinned = true;
  res.json(d);
});

router.post("/:id/unpin", (req, res) => {
  const d = discussions.find((x) => x.id === req.params.id);
  if (!d) {
    return res.status(404).json({ error: "Discussion not found" });
  }
  d.pinned = false;
  res.json(d);
});

router.post("/:id/lock", (req, res) => {
  const d = discussions.find((x) => x.id === req.params.id);
  if (!d) {
    return res.status(404).json({ error: "Discussion not found" });
  }
  d.locked = true;
  res.json(d);
});

router.post("/:id/unlock", (req, res) => {
  const d = discussions.find((x) => x.id === req.params.id);
  if (!d) {
    return res.status(404).json({ error: "Discussion not found" });
  }
  d.locked = false;
  res.json(d);
});

export const discussionsRouter = router;

