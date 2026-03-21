import { z } from 'zod';

export const updateAdminUserSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    isAdmin: z.boolean().optional(),
    scores: z
      .array(
        z.object({
          score: z.number().int().min(1).max(45),
          playedAt: z.string().min(1),
        })
      )
      .max(5)
      .optional(),
  })
  .refine((payload) => payload.fullName !== undefined || payload.isAdmin !== undefined || payload.scores !== undefined, {
    message: 'At least one field is required',
  });

export type UpdateAdminUserRequest = z.infer<typeof updateAdminUserSchema>;
