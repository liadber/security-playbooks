import type { Request } from 'express';
import type { z } from 'zod';
import type { PublicUser } from '../users/user.types.js';
import type { loginSchema, registerSchema } from './auth.schemas.js';

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** The token is for the auth cookie; it is never sent in the response body. */
export interface LoginResult {
  user: PublicUser;
  token: string;
}

export interface TokenService {
  signToken(userId: string): Promise<string>;
  /** Resolves to the user id, or null if the token is malformed, expired or tampered with. */
  verifyToken(token: string): Promise<string | null>;
}

export interface AuthService {
  register(input: RegisterInput): Promise<PublicUser>;
  login(input: LoginInput): Promise<LoginResult>;
  getCurrentUser(id: string): Promise<PublicUser>;
}

/** A request that passed requireAuth: userId is guaranteed to be present. */
export type AuthenticatedRequest = Request & { userId: string };
