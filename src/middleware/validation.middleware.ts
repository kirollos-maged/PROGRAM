import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const message = err.issues[0]?.message ?? 'Validation failed';
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message,
          details: err.issues,
        });
      }
      return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Validation middleware error' });
    }
  };

