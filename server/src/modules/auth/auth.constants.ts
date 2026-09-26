export const ARGON2_ALGORITHM = 'argon2id';
/** OWASP recommendation for Argon2id: 19 MiB, 2 passes, 1 lane. */
export const ARGON2_PARAMS = { memory: 19 * 1024, passes: 2, parallelism: 1 };
export const SALT_BYTES = 16;
export const HASH_BYTES = 32;
export const HASH_SEPARATOR = '$';

/**
 * Upper bounds for parameters read back from a stored hash, so a tampered record
 * cannot force an arbitrarily expensive verification.
 */
export const ARGON2_MAX_PARAMS = {
  memory: ARGON2_PARAMS.memory * 4,
  passes: ARGON2_PARAMS.passes * 5,
  parallelism: ARGON2_PARAMS.parallelism * 4,
};
/** Argon2 requires at least 8 KiB of memory per lane. */
export const ARGON2_MIN_MEMORY_PER_LANE = 8;
