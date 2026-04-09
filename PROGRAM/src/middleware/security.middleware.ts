import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { logActivity } from "../repositories/activityLog.repository";

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

export const rateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

export function botDetection(req: Request, res: Response, next: NextFunction) {
  const ua = req.headers["user-agent"] || "";
  const isBot =
    /bot|crawl|spider|slurp|headless|phantom/i.test(ua.toString()) &&
    !/chrome|firefox|safari|edge/i.test(ua.toString());

  if (isBot) {
    logActivity({
      type: "security",
      action: "bot_detected",
      ipAddress: req.ip,
      userAgent: ua.toString(),
    }).catch(() => {});
  }

  next();
}

export function deviceFingerprint(req: Request, _res: Response, next: NextFunction) {
  const ua = req.headers["user-agent"] || "";
  const acceptLang = req.headers["accept-language"] || "";
  const ip = req.ip || "";
  const raw = `${ua}|${acceptLang}|${ip}`;
  const fingerprint = Buffer.from(raw).toString("base64");
  (req as any).deviceFingerprint = fingerprint;
  next();
}

export function behaviorAnomalyDetector(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 2000) {
      logActivity({
        type: "security",
        action: "slow_request",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"]?.toString(),
        metadata: {
          path: req.path,
          method: req.method,
          durationMs: duration,
          statusCode: res.statusCode,
        },
      }).catch(() => {});
    }
  });

  next();
}

