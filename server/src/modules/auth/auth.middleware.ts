import type { Request, RequestHandler } from 'express';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { HttpError } from '../../shared/errors/http-error.js';
import { AUTH_COOKIE_NAME } from './auth.constants.js';
import type { AuthenticatedRequest, TokenService } from './auth.types.js';

/** Requires a valid token in the auth cookie (parsed by cookie-parser) and sets req.userId. */
export function requireAuth(tokens: TokenService): RequestHandler {
  return async (req, _res, next) => {
    const token: unknown = req.cookies[AUTH_COOKIE_NAME];
    const userId = typeof token === 'string' ? await tokens.verifyToken(token) : null;

    if (!userId) {
      throw new HttpError(HttpStatus.UNAUTHORIZED, 'Missing or invalid token');
    }

    req.userId = userId;
    next();
  };
}

/** Narrows a request that went through requireAuth, so req.userId can be read as a string. */
export function assertAuthenticated(req: Request): asserts req is AuthenticatedRequest {
  if (req.userId === undefined) {
    throw new HttpError(HttpStatus.UNAUTHORIZED, 'Missing or invalid token');
  }
}
