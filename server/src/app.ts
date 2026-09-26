import cookieParser from 'cookie-parser';
import express from 'express';
import type { Config } from './config/config.types.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { errorHandler } from './shared/middleware/error-handler.middleware.js';
import { notFoundHandler } from './shared/middleware/not-found.middleware.js';

export function createApp(config: Config) {
  const app = express();

  app.disable('x-powered-by');

  app.use(express.json());
  app.use(cookieParser());

  app.use('/health', healthRouter);
  app.use('/auth', createAuthRouter(config));

  // Order matters: the 404 handler catches anything the routes above did not,
  // and the error handler must be last so every error reaches it.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
