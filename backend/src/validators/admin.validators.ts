import { z } from 'zod';

export const updateAdminUserSchema = z
  .object({
    fullName: z.string().min(1).optional(),
    isAdmin: z.boolean().optional(),
  })
  .refine((payload) => payload.fullName !== undefined || payload.isAdmin !== undefined, {
    message: 'At least one field is required',
  });

export type UpdateAdminUserRequest = z.infer<typeof updateAdminUserSchema>;
