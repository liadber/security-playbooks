import { z } from 'zod';
import { PASSWORD_MIN_LENGTH } from './auth.constants.js';

// The only place an email is normalized: trimmed and lowercased before the format check.
const email = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .pipe(z.email('Must be a valid email address'));

export const registerSchema = z.object({
  email,
  password: z
    .string({ error: 'Password is required' })
    .min(PASSWORD_MIN_LENGTH, `Must be at least ${PASSWORD_MIN_LENGTH} characters`),
});

/** Login only checks that a password was sent; its length was enforced at registration. */
export const loginSchema = z.object({
  email,
  password: z.string({ error: 'Password is required' }).nonempty('Password is required'),
});
