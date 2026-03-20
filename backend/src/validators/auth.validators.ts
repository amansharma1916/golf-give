import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  charityId: z.string().uuid('Invalid charity ID'),
  contributionPercentage: z.number().int().min(10).max(100),
});

export type SignupRequest = z.infer<typeof signupSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
