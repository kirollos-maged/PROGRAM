import csrf from "csurf";
import type { Request, Response } from "express";

export const csrfProtection = csrf({ cookie: true });

export function sendCsrfToken(req: Request, res: Response) {
  const anyReq = req as Request & { csrfToken: () => string };
  res.json({ csrfToken: anyReq.csrfToken() });
}

