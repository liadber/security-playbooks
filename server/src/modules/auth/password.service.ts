import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import {
  ARGON2_ALGORITHM,
  ARGON2_MAX_PARAMS,
  ARGON2_MIN_MEMORY_PER_LANE,
  ARGON2_PARAMS,
  HASH_BYTES,
  HASH_SEPARATOR,
  SALT_BYTES,
} from './auth.constants.js';

const argon2Async = promisify(argon2);

type Argon2Params = typeof ARGON2_PARAMS;

async function derive(password: string, salt: Buffer, params: Argon2Params): Promise<Buffer> {
  return argon2Async(ARGON2_ALGORITHM, {
    message: password,
    nonce: salt,
    tagLength: HASH_BYTES,
    ...params,
  });
}

function parseParam(value: string | undefined, max: number): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= max ? parsed : null;
}

/**
 * Null for anything missing, malformed, out of range or that argon2 itself would reject,
 * so argon2 is never called with bad input.
 */
function parseParams(memory?: string, passes?: string, parallelism?: string): Argon2Params | null {
  const parsedMemory = parseParam(memory, ARGON2_MAX_PARAMS.memory);
  const parsedPasses = parseParam(passes, ARGON2_MAX_PARAMS.passes);
  const parsedParallelism = parseParam(parallelism, ARGON2_MAX_PARAMS.parallelism);

  if (parsedMemory === null || parsedPasses === null || parsedParallelism === null) return null;
  if (parsedMemory < ARGON2_MIN_MEMORY_PER_LANE * parsedParallelism) return null;

  return { memory: parsedMemory, passes: parsedPasses, parallelism: parsedParallelism };
}

/**
 * Returns "argon2id$<memory>$<passes>$<parallelism>$<salt>$<hash>": the parameters travel
 * with the hash, so they can be raised later without breaking existing users.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await derive(password, salt, ARGON2_PARAMS);
  const { memory, passes, parallelism } = ARGON2_PARAMS;

  return [
    ARGON2_ALGORITHM,
    memory,
    passes,
    parallelism,
    salt.toString('base64'),
    hash.toString('base64'),
  ].join(HASH_SEPARATOR);
}

/** Resolves to false, never throws, for a value that is not a well-formed stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, memory, passes, parallelism, saltB64, hashB64] = stored.split(HASH_SEPARATOR);
  const params = parseParams(memory, passes, parallelism);
  if (algorithm !== ARGON2_ALGORITHM || !params || !saltB64 || !hashB64) return false;

  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hashB64, 'base64');
  if (salt.length !== SALT_BYTES || expected.length !== HASH_BYTES) return false;

  const actual = await derive(password, salt, params);
  return timingSafeEqual(actual, expected);
}
