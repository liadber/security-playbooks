import { SignJWT, jwtVerify } from 'jose';
import { TOKEN_ALGORITHM, TOKEN_LIFETIME_SECONDS } from './auth.constants.js';
import type { TokenService } from './auth.types.js';

export function createTokenService(jwtSecret: string): TokenService {
  const secret = new TextEncoder().encode(jwtSecret);

  return {
    async signToken(userId) {
      return new SignJWT({})
        .setProtectedHeader({ alg: TOKEN_ALGORITHM })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(`${TOKEN_LIFETIME_SECONDS}s`)
        .sign(secret);
    },

    async verifyToken(token) {
      try {
        const { payload } = await jwtVerify(token, secret, { algorithms: [TOKEN_ALGORITHM] });
        return payload.sub ?? null;
      } catch {
        return null;
      }
    },
  };
}
