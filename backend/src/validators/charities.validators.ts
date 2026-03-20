import { z } from 'zod';

export const createCharitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  websiteUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
});

export const updateCharitySchema = createCharitySchema.partial();

export type CreateCharityRequest = z.infer<typeof createCharitySchema>;
export type UpdateCharityRequest = z.infer<typeof updateCharitySchema>;
