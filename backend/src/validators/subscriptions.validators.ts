import { z } from 'zod';

export const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
});

export type CheckoutRequest = z.infer<typeof checkoutSchema>;
