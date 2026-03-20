import { z } from 'zod';
import { STABLEFORD_MIN, STABLEFORD_MAX } from '../lib/constants';

export const addScoreSchema = z.object({
  score: z.number().int().min(STABLEFORD_MIN).max(STABLEFORD_MAX),
  playedAt: z.string().refine((date) => {
    const d = new Date(date);
    return !isNaN(d.getTime()) && d <= new Date();
  }, 'Invalid date or future date provided'),
});

export const updateScoreSchema = addScoreSchema.partial();

export type AddScoreRequest = z.infer<typeof addScoreSchema>;
export type UpdateScoreRequest = z.infer<typeof updateScoreSchema>;
