import request, { type Response } from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { loggedInAgent } from '../../shared/testing/test-agent.js';
import { TEST_CONFIG } from '../../shared/testing/test-config.js';
import { useTestDatabase } from '../../shared/testing/test-db.js';
import { AUTH_COOKIE_NAME, TOKEN_LIFETIME_SECONDS } from './auth.constants.js';
import { createTokenService } from './token.service.js';

const app = createApp(TEST_CONFIG);
useTestDatabase();

const credentials = { email: 'alice@example.com', password: 'correct-horse' };

const register = () => request(app).post('/auth/register').send(credentials);
const login = (body = credentials) => request(app).post('/auth/login').send(body);

/**
 * The Set-Cookie header for the auth cookie, e.g.
 * "token=<jwt>; Max-Age=3600; Path=/; Expires=...; HttpOnly; SameSite=Strict".
 */
function authCookie(res: Response): string {
  const cookie = (res.get('Set-Cookie') ?? []).find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
  expect(cookie).toBeDefined();
  return cookie!;
}

const cookieValue = (cookie: string) => cookie.split(';')[0].slice(AUTH_COOKIE_NAME.length + 1);

describe('POST /auth/register', () => {
  it('returns 201 with the id and email', async () => {
    const res = await register();

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toEqual({ id: expect.any(String), email: credentials.email });
  });

  it('never includes the password hash in the response', async () => {
    const res = await register();

    expect(res.body).not.toHaveProperty('passwordHash');
    expect(res.text).not.toContain('passwordHash');
  });

  it('returns 400 with a message per invalid field', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      error: 'Validation failed',
      fields: {
        email: 'Must be a valid email address',
        password: 'Must be at least 8 characters',
      },
    });
  });

  it('returns 409 when the email is already registered', async () => {
    await register();
    const res = await register();

    expect(res.status).toBe(HttpStatus.CONFLICT);
    expect(res.body).toEqual({ error: 'Email is already registered' });
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await register();
  });

  it('returns 200 with the user and keeps the token out of the body', async () => {
    const res = await login();

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({ id: expect.any(String), email: credentials.email });
    expect(res.text).not.toContain(cookieValue(authCookie(res)));
  });

  it('sets an httpOnly, SameSite=Strict cookie that lives as long as the token', async () => {
    const cookie = authCookie(await login());

    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);
    expect(cookie).toMatch(/Path=\//);
    expect(cookie).toContain(`Max-Age=${TOKEN_LIFETIME_SECONDS}`);
    expect(cookie).not.toMatch(/Secure/);
  });

  it('marks the cookie Secure when the config says so', async () => {
    const secureApp = createApp({ ...TEST_CONFIG, cookieSecure: true });
    const res = await request(secureApp).post('/auth/login').send(credentials);

    expect(res.status).toBe(HttpStatus.OK);
    expect(authCookie(res)).toMatch(/Secure/);
  });

  it('returns the same 401 message for an unknown email and for a wrong password', async () => {
    const unknownEmail = await login({ email: 'nobody@example.com', password: 'correct-horse' });
    const wrongPassword = await login({ email: credentials.email, password: 'wrong-horse' });

    expect(unknownEmail.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(wrongPassword.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(unknownEmail.body).toEqual({ error: 'Invalid email or password' });
    expect(wrongPassword.body).toEqual(unknownEmail.body);
    expect(unknownEmail.get('Set-Cookie')).toBeUndefined();
  });

  it('accepts the email in uppercase', async () => {
    const res = await login({ ...credentials, email: credentials.email.toUpperCase() });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.email).toBe(credentials.email);
  });
});

describe('GET /auth/me', () => {
  const meWithCookie = (token: string) =>
    request(app).get('/auth/me').set('Cookie', `${AUTH_COOKIE_NAME}=${token}`);

  it('returns 200 with the current user when the login cookie is sent', async () => {
    const { agent, userId } = await loggedInAgent(app, credentials);

    const res = await agent.get('/auth/me');

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({ id: userId, email: credentials.email });
  });

  it('returns 401 without a cookie', async () => {
    const res = await request(app).get('/auth/me');

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: 'Missing or invalid token' });
  });

  it('returns 401 for a tampered cookie', async () => {
    await register();
    const token = cookieValue(authCookie(await login()));
    const [header, , signature] = token.split('.');
    const otherPayload = Buffer.from(JSON.stringify({ sub: 'someone-else' })).toString('base64url');

    const res = await meWithCookie(`${header}.${otherPayload}.${signature}`);

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: 'Missing or invalid token' });
  });

  it('returns 401 for a cookie signed with another secret', async () => {
    const registered = await register();
    const forged = await createTokenService('not-the-server-secret').signToken(registered.body.id);

    const res = await meWithCookie(forged);

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: 'Missing or invalid token' });
  });
});

describe('POST /auth/logout', () => {
  it('clears the cookie with the same attributes and returns 204', async () => {
    const { agent } = await loggedInAgent(app, credentials);

    const res = await agent.post('/auth/logout');

    expect(res.status).toBe(HttpStatus.NO_CONTENT);
    const cookie = authCookie(res);
    expect(cookieValue(cookie)).toBe('');
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Strict/);
    expect(cookie).toMatch(/Path=\//);
  });

  it('makes /auth/me answer 401 afterwards', async () => {
    const { agent } = await loggedInAgent(app, credentials);
    await agent.post('/auth/logout');

    const res = await agent.get('/auth/me');

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: 'Missing or invalid token' });
  });

  it('returns 204 when nobody is logged in', async () => {
    const res = await request(app).post('/auth/logout');

    expect(res.status).toBe(HttpStatus.NO_CONTENT);
  });
});
