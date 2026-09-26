import type { CookieOptions } from 'express';
import { TOKEN_LIFETIME_SECONDS } from './auth.constants.js';

const MS_PER_SECOND = 1000;

/**
 * Options for the cookie that carries the JWT (see "Authentication" in the README).
 * Also used to clear the cookie, so the browser matches it.
 */
export function authCookieOptions(secure: boolean): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure,
    path: '/',
    maxAge: TOKEN_LIFETIME_SECONDS * MS_PER_SECOND,
  };
}
