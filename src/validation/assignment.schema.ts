import { z } from 'zod';

export const submitAssignmentSchema = z.object({
  body: z.object({
    content: z.string().max(20000).optional(),
  }).passthrough(),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    score: z.number().min(0),
    feedback: z.string().max(20000).optional(),
  }).strict(),
});

