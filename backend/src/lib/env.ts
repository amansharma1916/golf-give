import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  FRONTEND_URL: z.string().url(),
  PAYMENT_MODE: z.enum(['demo', 'live']).default('demo'),
  RESEND_API_KEY: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const env = envSchema.parse(process.env);
  cachedEnv = env;
  return env;
}

export const env = getEnv();
