import { z } from 'zod';

export const createDisputeSchema = z.object({
  payoutId: z.string().uuid('Invalid payout ID'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
});

export const resolveDisputeSchema = z.object({
  status: z.enum(['investigating', 'resolved', 'rejected']),
  adminResponse: z.string().min(5, 'Response must be at least 5 characters').optional(),
});

export type CreateDisputeRequest = z.infer<typeof createDisputeSchema>;
export type ResolveDisputeRequest = z.infer<typeof resolveDisputeSchema>;
