import { z } from 'zod';
import { DEFAULT_PORT } from './config.constants.js';
import type { Config } from './config.types.js';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),
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

  return { port: result.data.PORT };
}
