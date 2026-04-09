import { Router } from "express";

// This admin router exposes simple dashboard-style endpoints.
// In a real app you would aggregate data from your DB.

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "PROGRAM-admin" });
});

router.get("/analytics", (_req, res) => {
  // Placeholder analytics; extend as needed.
  res.json({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenueCents: 0
  });
});

router.get("/settings", (_req, res) => {
  res.json({
    refunds: {
      autoApproveTechnicalIssues: false
    },
    payments: {
      defaultGateway: "test"
    }
  });
});

export const adminRouter = router;

