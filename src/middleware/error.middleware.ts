import { Request, Response, NextFunction } from 'express';
import { RepositoryError } from '../repositories/errors';

export function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  // Log the error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Simple centralized error handler; extend as needed
  if (err instanceof RepositoryError) {
    return res.status(err.status).json({
      error: err.code,
      message: err.message,
    });
  }

  const status = err?.status || 500;
  const message = err?.message || 'Internal Server Error';
  return res.status(status).json({ error: 'internal_error', message });
}

