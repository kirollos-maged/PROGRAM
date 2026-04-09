import { z } from 'zod';

export const createSectionSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
  }).strict(),
});

export const updateSectionSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
  }).strict(),
});

export const reorderSectionsSchema = z.object({
  body: z.object({
    sectionIds: z.array(z.number().int().positive()).min(1),
  }).strict(),
});

