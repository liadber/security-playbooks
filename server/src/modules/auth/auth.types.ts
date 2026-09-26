import type { Request } from 'express';

export interface TokenService {
  signToken(userId: string): Promise<string>;
  /** Resolves to the user id, or null if the token is malformed, expired or tampered with. */
  verifyToken(token: string): Promise<string | null>;
}

/** A request that passed requireAuth: userId is guaranteed to be present. */
export type AuthenticatedRequest = Request & { userId: string };
