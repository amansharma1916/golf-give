import { z } from 'zod';

export const createDrawSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  drawType: z.enum(['random', 'algorithmic']).default('random'),
  algorithmMode: z.enum(['most_common', 'least_common']).optional(),
});

export const simulateDrawSchema = z.object({
  drawType: z.enum(['random', 'algorithmic']),
  algorithmMode: z.enum(['most_common', 'least_common']).optional(),
});

export const publishDrawSchema = z.object({
  winningNumbers: z
    .array(z.number().int().min(1).max(45))
    .length(5)
    .refine(
      (arr) => new Set(arr).size === arr.length,
      'Winning numbers must be unique'
    ),
});

export const configureDrawSchema = z.object({
  drawType: z.enum(['random', 'algorithmic']),
  algorithmMode: z.enum(['most_common', 'least_common']).optional(),
});

export type CreateDrawRequest = z.infer<typeof createDrawSchema>;
export type SimulateDrawRequest = z.infer<typeof simulateDrawSchema>;
export type PublishDrawRequest = z.infer<typeof publishDrawSchema>;
export type ConfigureDrawRequest = z.infer<typeof configureDrawSchema>;
