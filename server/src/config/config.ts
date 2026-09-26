import { z } from 'zod';
import { DEFAULT_PORT } from './config.constants.js';
import type { Config } from './config.types.js';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
  MONGODB_URI: z.string({ error: 'is required' }).nonempty('must not be empty'),
  JWT_SECRET: z.string({ error: 'is required' }).nonempty('must not be empty'),
  COOKIE_SECURE: z
    .enum(['true', 'false'], {
      error: (issue) => (issue.input === undefined ? 'is required' : 'must be true or false'),
    })
    .transform((value) => value === 'true'),
});

/**
 * Reads and validates configuration from environment variables.
 * Throws instead of exiting so the caller decides what a bad configuration means for the process.
 */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join('.')} ${issue.message}`)
      .join('; ');
    throw new Error(
      `Invalid configuration: ${problems}. Copy .env.example to .env and fill it in.`,
    );
  }

  return {
    port: result.data.PORT,
    mongodbUri: result.data.MONGODB_URI,
    jwtSecret: result.data.JWT_SECRET,
    cookieSecure: result.data.COOKIE_SECURE,
  };
}
