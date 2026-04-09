import { z } from 'zod';

export const createQuizSchema = z.object({
  body: z.object({
    courseId: z.number().int().positive(),
    title: z.string().min(3).max(255),
    description: z.string().max(20000).optional(),
    timeLimitMinutes: z.number().int().min(1).max(600).nullable().optional(),
    maxAttempts: z.number().int().min(1).max(50).nullable().optional(),
    isRandomized: z.boolean().optional(),
  }).strict(),
});

export const addQuestionSchema = z.object({
  body: z.object({
    questionText: z.string().min(1).max(20000),
    questionType: z.enum(['multiple_choice', 'true_false', 'short_answer']),
    points: z.number().min(0).max(100),
  }).strict(),
});

export const addAnswerSchema = z.object({
  body: z.object({
    answerText: z.string().min(1).max(20000),
    isCorrect: z.boolean(),
  }).strict(),
});

export const submitAttemptSchema = z.object({
  body: z.object({
    answers: z.array(z.object({
      questionId: z.number().int().positive(),
      answerId: z.number().int().positive().optional(),
      answerText: z.string().max(20000).optional(),
    })).min(0),
  }).strict(),
});

