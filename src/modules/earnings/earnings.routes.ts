import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

type PayoutStatus = "pending" | "paid";

interface EnrollmentEarning {
  id: string;
  instructorId: string;
  courseId: string;
  paymentId: string;
  amountCents: number;
  platformShareCents: number;
  instructorShareCents: number;
  createdAt: string;
}

interface Payout {
  id: string;
  instructorId: string;
  amountCents: number;
  status: PayoutStatus;
  createdAt: string;
  paidAt?: string;
}

const router = Router();

const earnings: EnrollmentEarning[] = [];
const payouts: Payout[] = [];

const recordEarningSchema = z.object({
  instructorId: z.string(),
  courseId: z.string(),
  paymentId: z.string(),
  amountCents: z.number().int().positive(),
  instructorPercent: z.number().min(0).max(100).default(70)
});

router.post("/record", (req, res) => {
  const parsed = recordEarningSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const instructorShare = Math.round(
    (parsed.data.amountCents * parsed.data.instructorPercent) / 100
  );
  const platformShare = parsed.data.amountCents - instructorShare;
  const e: EnrollmentEarning = {
    id: uuid(),
    instructorId: parsed.data.instructorId,
    courseId: parsed.data.courseId,
    paymentId: parsed.data.paymentId,
    amountCents: parsed.data.amountCents,
    platformShareCents: platformShare,
    instructorShareCents: instructorShare,
    createdAt: now
  };
  earnings.push(e);
  res.status(201).json(e);
});

router.get("/instructor/:instructorId", (req, res) => {
  const instructorEarnings = earnings.filter(
    (e) => e.instructorId === req.params.instructorId
  );
  const totalInstructorShare = instructorEarnings.reduce(
    (sum, e) => sum + e.instructorShareCents,
    0
  );
  const totalPlatformShare = instructorEarnings.reduce(
    (sum, e) => sum + e.platformShareCents,
    0
  );
  res.json({
    instructorId: req.params.instructorId,
    totalInstructorShareCents: totalInstructorShare,
    totalPlatformShareCents: totalPlatformShare,
    earnings: instructorEarnings
  });
});

const createPayoutSchema = z.object({
  instructorId: z.string(),
  amountCents: z.number().int().positive()
});

router.post("/payouts", (req, res) => {
  const parsed = createPayoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const p: Payout = {
    id: uuid(),
    instructorId: parsed.data.instructorId,
    amountCents: parsed.data.amountCents,
    status: "pending",
    createdAt: now
  };
  payouts.push(p);
  res.status(201).json(p);
});

router.post("/payouts/:id/mark-paid", (req, res) => {
  const p = payouts.find((x) => x.id === req.params.id);
  if (!p) {
    return res.status(404).json({ error: "Payout not found" });
  }
  p.status = "paid";
  p.paidAt = new Date().toISOString();
  res.json(p);
});

router.get("/payouts/:instructorId", (req, res) => {
  const list = payouts.filter((p) => p.instructorId === req.params.instructorId);
  res.json(list);
});

export const earningsRouter = router;

