import { SignJWT, decodeJwt } from 'jose';
import { describe, expect, it } from 'vitest';
import { TOKEN_ALGORITHM, TOKEN_LIFETIME_SECONDS } from './auth.constants.js';
import { createTokenService } from './token.service.js';

const SECRET = 'test-secret';
const USER_ID = 'user-123';

describe('token service', () => {
  const tokens = createTokenService(SECRET);

  it('returns the user id for a valid token', async () => {
    const token = await tokens.signToken(USER_ID);
    expect(await tokens.verifyToken(token)).toBe(USER_ID);
  });

  it('expires the token after the configured lifetime', async () => {
    const { iat, exp } = decodeJwt(await tokens.signToken(USER_ID));
    expect(exp! - iat!).toBe(TOKEN_LIFETIME_SECONDS);
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = await createTokenService('other-secret').signToken(USER_ID);
    expect(await tokens.verifyToken(forged)).toBeNull();
  });

  it('rejects a tampered token', async () => {
    const token = await tokens.signToken(USER_ID);
    const [header, , signature] = token.split('.');
    const otherPayload = Buffer.from(JSON.stringify({ sub: 'someone-else' })).toString('base64url');
    expect(await tokens.verifyToken(`${header}.${otherPayload}.${signature}`)).toBeNull();
  });

  it('rejects a malformed token', async () => {
    expect(await tokens.verifyToken('not.a.jwt')).toBeNull();
    expect(await tokens.verifyToken('')).toBeNull();
  });

  it('rejects an expired token', async () => {
    const oneMinuteAgo = Math.floor(Date.now() / 1000) - 60;
    const expired = await new SignJWT({})
      .setProtectedHeader({ alg: TOKEN_ALGORITHM })
      .setSubject(USER_ID)
      .setExpirationTime(oneMinuteAgo)
      .sign(new TextEncoder().encode(SECRET));

    expect(await tokens.verifyToken(expired)).toBeNull();
  });
});
