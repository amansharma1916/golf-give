import { z } from 'zod';

export const simulateDrawSchema = z.object({
  drawType: z.enum(['random', 'algorithmic']),
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
});

export type SimulateDrawRequest = z.infer<typeof simulateDrawSchema>;
export type PublishDrawRequest = z.infer<typeof publishDrawSchema>;
export type ConfigureDrawRequest = z.infer<typeof configureDrawSchema>;
