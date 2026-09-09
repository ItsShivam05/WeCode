import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  DATABASE_URL: z
    .string()
    .default('postgresql://wecode_user:wecode_password@localhost:5432/wecode_db?schema=public'),
  RUNNER_CONCURRENCY: z.coerce.number().default(2),
  SANDBOX_DRIVER: z.enum(['docker', 'process']).default('process'),
  DOCKER_IMAGE_CPP: z.string().default('wecode-cpp-runner:latest'),
  DEFAULT_TIME_LIMIT_MS: z.coerce.number().default(2000),
  DEFAULT_MEMORY_LIMIT_MB: z.coerce.number().default(256),
  MAX_OUTPUT_SIZE_BYTES: z.coerce.number().default(65536),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid Runner Environment Variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
