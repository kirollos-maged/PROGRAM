import { z } from 'zod';
import { strongPasswordSchema } from './password';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: strongPasswordSchema,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(10),
  }),
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: strongPasswordSchema,
  }),
});

