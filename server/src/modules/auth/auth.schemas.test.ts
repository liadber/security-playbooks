import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from './auth.schemas.js';

// Maps zod issues to { field: message } the same way the validation middleware does.
function fieldErrors(result: { success: boolean; error?: { issues: unknown[] } }) {
  if (result.success || !result.error) return {};
  const issues = result.error.issues as { path: PropertyKey[]; message: string }[];
  return Object.fromEntries(issues.map((issue) => [issue.path.join('.'), issue.message]));
}

describe('registerSchema', () => {
  it('accepts a valid email and password', () => {
    const result = registerSchema.safeParse({ email: 'alice@example.com', password: 'longenough' });
    expect(result.success).toBe(true);
  });

  it('normalizes the email by trimming and lowercasing it', () => {
    const result = registerSchema.safeParse({
      email: '  Alice@Example.COM ',
      password: 'longenough',
    });
    expect(result.success && result.data.email).toBe('alice@example.com');
  });

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ email: 'not-an-email', password: 'longenough' });
    expect(fieldErrors(result)).toEqual({ email: 'Must be a valid email address' });
  });

  it('rejects a password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ email: 'alice@example.com', password: 'short' });
    expect(fieldErrors(result)).toEqual({ password: 'Must be at least 8 characters' });
  });

  it('reports every missing field as required', () => {
    expect(fieldErrors(registerSchema.safeParse({}))).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });
});

describe('loginSchema', () => {
  it('accepts any non-empty password', () => {
    const result = loginSchema.safeParse({ email: 'alice@example.com', password: 'x' });
    expect(result.success).toBe(true);
  });

  it('rejects an empty password', () => {
    const result = loginSchema.safeParse({ email: 'alice@example.com', password: '' });
    expect(fieldErrors(result)).toEqual({ password: 'Password is required' });
  });

  it('normalizes the email the same way as registration', () => {
    const result = loginSchema.safeParse({ email: 'ALICE@EXAMPLE.COM', password: 'x' });
    expect(result.success && result.data.email).toBe('alice@example.com');
  });

  it('reports every missing field as required', () => {
    expect(fieldErrors(loginSchema.safeParse({}))).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });
});
