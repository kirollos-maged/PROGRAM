import { Router } from "express";
import { z } from "zod";

const router = Router();

// In-memory demo storage; replace with DB later.
const lessonCompletion: Record<string, Set<string>> = {};
const videoWatchTime: Record<string, number> = {};
const courseCompletion: Record<string, Set<string>> = {};

const progressBodySchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  lessonId: z.string().optional(),
  videoSeconds: z.number().int().nonnegative().optional()
});

router.post("/track", (req, res) => {
  const parsed = progressBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { userId, courseId, lessonId, videoSeconds } = parsed.data;

  if (lessonId) {
    const key = `${userId}:${courseId}`;
    if (!lessonCompletion[key]) {
      lessonCompletion[key] = new Set();
    }
    lessonCompletion[key].add(lessonId);
  }

  if (typeof videoSeconds === "number") {
    const key = `${userId}:${courseId}`;
    videoWatchTime[key] = (videoWatchTime[key] || 0) + videoSeconds;
  }

  res.json({ ok: true });
});

router.post("/complete-course", (req, res) => {
  const schema = z.object({
    userId: z.string(),
    courseId: z.string()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { userId, courseId } = parsed.data;
  const key = userId;
  if (!courseCompletion[key]) {
    courseCompletion[key] = new Set();
  }
  courseCompletion[key].add(courseId);
  res.json({ ok: true });
});

router.get("/user/:userId/courses/:courseId", (req, res) => {
  const { userId, courseId } = req.params;
  const lessonKey = `${userId}:${courseId}`;
  const videoKey = `${userId}:${courseId}`;
  const completedLessons = Array.from(lessonCompletion[lessonKey] || []);
  const watchedSeconds = videoWatchTime[videoKey] || 0;
  const completedCourses = courseCompletion[userId] || new Set();
  const isCourseCompleted = completedCourses.has(courseId);

  res.json({
    userId,
    courseId,
    completedLessons,
    watchedSeconds,
    isCourseCompleted
  });
});

export const progressRouter = router;

