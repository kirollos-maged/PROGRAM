import { z } from 'zod';

export const createLessonSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    lessonType: z.enum(['video', 'text', 'quiz', 'assignment']),
    content: z.string().max(20000).optional(),
    videoUrl: z.string().url().max(500).optional(),
    durationMinutes: z.number().int().min(0).optional(),
    isPreview: z.boolean().optional(),
  }).strict(),
});

export const updateLessonSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().max(20000).nullable().optional(),
    videoUrl: z.string().url().max(500).nullable().optional(),
    durationMinutes: z.number().int().min(0).nullable().optional(),
    isPreview: z.boolean().optional(),
    sortOrder: z.never().optional(),
    sectionId: z.never().optional(),
    lessonType: z.never().optional(),
  }).strict(),
});

export const reorderLessonsSchema = z.object({
  body: z.object({
    lessonIds: z.array(z.number().int().positive()).min(1),
  }).strict(),
});

