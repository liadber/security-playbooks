import { Router } from 'express';
import type { Config } from '../../config/config.types.js';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { assertAuthenticated, requireAuth } from './auth.middleware.js';
import { validateBody } from '../../shared/middleware/validate.middleware.js';
import { AUTH_COOKIE_NAME } from './auth.constants.js';
import { authCookieOptions } from './auth.cookie.js';
import { loginSchema, registerSchema } from './auth.schemas.js';
import { createAuthService } from './auth.service.js';
import { createTokenService } from './token.service.js';

export function createAuthRouter(config: Config): Router {
  const tokens = createTokenService(config.jwtSecret);
  const authService = createAuthService(tokens);
  const cookieOptions = authCookieOptions(config.cookieSecure);
  const router = Router();

  router.post('/register', validateBody(registerSchema), async (req, res) => {
    const user = await authService.register(req.body);
    res.status(HttpStatus.CREATED).json(user);
  });

  router.post('/login', validateBody(loginSchema), async (req, res) => {
    const { user, token } = await authService.login(req.body);
    res.cookie(AUTH_COOKIE_NAME, token, cookieOptions).json(user);
  });

  // Needs no authentication: clearing an absent cookie is harmless.
  router.post('/logout', (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions).status(HttpStatus.NO_CONTENT).end();
  });

  router.get('/me', requireAuth(tokens), async (req, res) => {
    assertAuthenticated(req);
    res.json(await authService.getCurrentUser(req.userId));
  });

  return router;
}
