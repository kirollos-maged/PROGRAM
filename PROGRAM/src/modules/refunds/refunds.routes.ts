import { Router } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";

type RefundReason = "technical_issue" | "duplicate_purchase" | "user_request" | "fraud";

type RefundStatus = "pending" | "approved" | "rejected" | "processed";

interface RefundRequest {
  id: string;
  paymentId: string;
  userId: string;
  reason: RefundReason;
  notes?: string;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
  approvedByAdminId?: string;
  rejectionReason?: string;
}

const router = Router();

const refunds: RefundRequest[] = [];

const createRefundSchema = z.object({
  paymentId: z.string(),
  userId: z.string(),
  reason: z.enum(["technical_issue", "duplicate_purchase", "user_request", "fraud"]),
  notes: z.string().optional()
});

router.post("/", (req, res) => {
  const parsed = createRefundSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const data = parsed.data;
  const refund: RefundRequest = {
    id: uuid(),
    paymentId: data.paymentId,
    userId: data.userId,
    reason: data.reason,
    notes: data.notes,
    status: "pending",
    createdAt: now,
    updatedAt: now
  };
  refunds.push(refund);
  res.status(201).json(refund);
});

router.get("/", (_req, res) => {
  res.json(refunds);
});

router.get("/:id", (req, res) => {
  const refund = refunds.find((r) => r.id === req.params.id);
  if (!refund) {
    return res.status(404).json({ error: "Refund not found" });
  }
  res.json(refund);
});

const adminDecisionSchema = z.object({
  adminId: z.string(),
  reason: z.string().optional()
});

router.post("/:id/approve", (req, res) => {
  const parsed = adminDecisionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const refund = refunds.find((r) => r.id === req.params.id);
  if (!refund) {
    return res.status(404).json({ error: "Refund not found" });
  }
  if (refund.status !== "pending") {
    return res.status(400).json({ error: "Refund is not pending" });
  }
  refund.status = "approved";
  refund.approvedByAdminId = parsed.data.adminId;
  refund.updatedAt = new Date().toISOString();
  res.json(refund);
});

router.post("/:id/reject", (req, res) => {
  const parsed = adminDecisionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const refund = refunds.find((r) => r.id === req.params.id);
  if (!refund) {
    return res.status(404).json({ error: "Refund not found" });
  }
  if (refund.status !== "pending") {
    return res.status(400).json({ error: "Refund is not pending" });
  }
  refund.status = "rejected";
  refund.rejectionReason = parsed.data.reason;
  refund.approvedByAdminId = parsed.data.adminId;
  refund.updatedAt = new Date().toISOString();
  res.json(refund);
});

router.post("/:id/mark-processed", (req, res) => {
  const refund = refunds.find((r) => r.id === req.params.id);
  if (!refund) {
    return res.status(404).json({ error: "Refund not found" });
  }
  if (refund.status !== "approved") {
    return res.status(400).json({ error: "Refund must be approved before processing" });
  }
  refund.status = "processed";
  refund.updatedAt = new Date().toISOString();
  res.json(refund);
});

export const refundsRouter = router;

