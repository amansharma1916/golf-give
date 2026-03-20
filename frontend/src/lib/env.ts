import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_PAYMENT_MODE: z.enum(['demo', 'live']).default('demo'),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error('Invalid frontend environment variables');
}

export const env = parsedEnv.data;
