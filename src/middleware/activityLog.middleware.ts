import type { Request, Response, NextFunction } from "express";
import { logActivity } from "../repositories/activityLog.repository";

export function requestActivityLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const type: "user" | "admin" =
      req.path.startsWith("/admin") || req.path.startsWith("/auth/admin")
        ? "admin"
        : "user";

    logActivity({
      type,
      action: `${req.method} ${req.path}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]?.toString(),
      metadata: {
        statusCode: res.statusCode,
        durationMs: duration,
      },
    }).catch(() => {});
  });

  next();
}

export function errorActivityLogger(err: any, req: Request, res: Response, next: NextFunction) {
  logActivity({
    type: "error",
    action: err?.message || "unknown_error",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]?.toString(),
    metadata: {
      stack: err?.stack,
      path: req.path,
      method: req.method,
    },
  }).catch(() => {});

  next(err);
}

