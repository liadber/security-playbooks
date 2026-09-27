export const PASSWORD_MIN_LENGTH = 8;

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

export const TOKEN_ALGORITHM = 'HS256';
/** Single source of truth for both the JWT expiry and the auth cookie's max-age. */
export const TOKEN_LIFETIME_SECONDS = 60 * 60;
export const AUTH_COOKIE_NAME = 'token';

/** Messages of the errors this module answers with; the client shows them as they are. */
export const AUTH_ERRORS = {
  INVALID_TOKEN: 'Missing or invalid token',
  EMAIL_TAKEN: 'Email is already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_GONE: 'User no longer exists',
} as const;
