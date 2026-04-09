import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

interface PaymentRecord {
  id: string;
  userId: string;
  courseId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  gateway: "stripe" | "paypal" | "manual" | "test";
  metadata: Record<string, unknown>;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface Coupon {
  code: string;
  description?: string;
  percentOff?: number;
  amountOffCents?: number;
  maxRedemptions?: number;
  redeemedCount: number;
  active: boolean;
}

const router = Router();

const payments: PaymentRecord[] = [];
const coupons: Coupon[] = [];

const createPaymentSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  amountCents: z.number().int().positive(),
  currency: z.string().default("USD"),
  gateway: z.enum(["stripe", "paypal", "manual", "test"]).default("test"),
  metadata: z.record(z.unknown()).default({}),
  couponCode: z.string().optional()
});

const createCouponSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
  percentOff: z.number().min(0).max(100).optional(),
  amountOffCents: z.number().int().nonnegative().optional(),
  maxRedemptions: z.number().int().positive().optional()
});

router.post("/", (req, res) => {
  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const now = new Date().toISOString();
  const data = parsed.data;

  let finalAmount = data.amountCents;
  let appliedCoupon: Coupon | undefined;

  if (data.couponCode) {
    const coupon = coupons.find(
      (c) => c.code.toLowerCase() === data.couponCode!.toLowerCase() && c.active
    );
    if (coupon) {
      appliedCoupon = coupon;
      if (coupon.percentOff) {
        finalAmount = Math.round((finalAmount * (100 - coupon.percentOff)) / 100);
      }
      if (coupon.amountOffCents) {
        finalAmount = Math.max(0, finalAmount - coupon.amountOffCents);
      }
      if (coupon.maxRedemptions && coupon.redeemedCount >= coupon.maxRedemptions) {
        return res.status(400).json({ error: "Coupon max redemptions reached" });
      }
      coupon.redeemedCount += 1;
    }
  }

  const payment: PaymentRecord = {
    id: uuid(),
    userId: data.userId,
    courseId: data.courseId,
    amountCents: finalAmount,
    currency: data.currency,
    status: "pending",
    gateway: data.gateway,
    metadata: data.metadata,
    couponCode: appliedCoupon?.code,
    createdAt: now,
    updatedAt: now
  };

  // For demo purposes mark all test/manual payments as succeeded immediately.
  payment.status = "succeeded";
  payment.updatedAt = new Date().toISOString();

  payments.push(payment);

  res.status(201).json(payment);
});

router.get("/", (_req, res) => {
  res.json(payments);
});

// Use a more specific prefix to avoid conflicts with /coupons routes.
router.get("/by-id/:id", (req, res) => {
  const payment = payments.find((p) => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }
  res.json(payment);
});

router.post("/by-id/:id/metadata", (req, res) => {
  const schema = z.object({
    metadata: z.record(z.unknown())
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const payment = payments.find((p) => p.id === req.params.id);
  if (!payment) {
    return res.status(404).json({ error: "Payment not found" });
  }
  payment.metadata = { ...payment.metadata, ...parsed.data.metadata };
  payment.updatedAt = new Date().toISOString();
  res.json(payment);
});

router.post("/coupons", (req, res) => {
  const parsed = createCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const data = parsed.data;
  if (!data.percentOff && !data.amountOffCents) {
    return res
      .status(400)
      .json({ error: "Either percentOff or amountOffCents must be provided" });
  }
  if (coupons.some((c) => c.code.toLowerCase() === data.code.toLowerCase())) {
    return res.status(400).json({ error: "Coupon with this code already exists" });
  }
  const coupon: Coupon = {
    code: data.code,
    description: data.description,
    percentOff: data.percentOff,
    amountOffCents: data.amountOffCents,
    maxRedemptions: data.maxRedemptions,
    redeemedCount: 0,
    active: true
  };
  coupons.push(coupon);
  res.status(201).json(coupon);
});

router.get("/coupons", (_req, res) => {
  res.json(coupons);
});

router.patch("/coupons/:code", (req, res) => {
  const schema = z.object({
    active: z.boolean().optional(),
    description: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const coupon = coupons.find(
    (c) => c.code.toLowerCase() === req.params.code.toLowerCase()
  );
  if (!coupon) {
    return res.status(404).json({ error: "Coupon not found" });
  }
  if (typeof parsed.data.active === "boolean") {
    coupon.active = parsed.data.active;
  }
  if (typeof parsed.data.description === "string") {
    coupon.description = parsed.data.description;
  }
  res.json(coupon);
});

export const paymentsRouter = router;

