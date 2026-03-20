import { z } from 'zod';

export const uploadProofSchema = z.object({
  proofUrl: z.string().url(),
});

export const verifyProofSchema = z.object({
  approved: z.boolean(),
  adminNote: z.string().optional(),
});

export type UploadProofRequest = z.infer<typeof uploadProofSchema>;
export type VerifyProofRequest = z.infer<typeof verifyProofSchema>;
