import { z } from 'zod';

export const updateProgressSchema = z.object({
  body: z.object({
    watchedSeconds: z.number().int().min(0),
    totalSeconds: z.number().int().min(0).nullable().optional(),
  }).strict(),
});

export const addVideoBookmarkSchema = z.object({
  body: z.object({
    positionSeconds: z.number().int().min(0),
    note: z.string().max(2000).optional(),
  }).strict(),
});

export const addCaptionSchema = z.object({
  body: z.object({
    languageCode: z.string().min(2).max(10),
    captionUrl: z.string().url().max(500),
  }).strict(),
});

