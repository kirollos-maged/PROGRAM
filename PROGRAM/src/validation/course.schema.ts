import { z } from 'zod';

export const createCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255),
    description: z.string().max(20000).optional(),
    price: z.number().min(0),
    categoryId: z.number().int().positive(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).optional(),
    thumbnailUrl: z.string().url().max(500).optional(),
    status: z.never().optional(),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255).optional(),
    description: z.string().max(20000).nullable().optional(),
    price: z.number().min(0).optional(),
    categoryId: z.number().int().positive().optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced', 'all']).nullable().optional(),
    thumbnailUrl: z.string().url().max(500).nullable().optional(),
    status: z.never().optional(),
    slug: z.never().optional(),
    instructor_id: z.never().optional(),
    category_id: z.never().optional(),
  }).strict(),
});

