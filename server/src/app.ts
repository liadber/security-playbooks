import express from 'express';
import { healthRouter } from './modules/health/health.routes.js';
import { errorHandler } from './shared/middleware/error-handler.middleware.js';
import { notFoundHandler } from './shared/middleware/not-found.middleware.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(express.json());

  app.use('/health', healthRouter);

  // Order matters: the 404 handler catches anything the routes above did not,
  // and the error handler must be last so every error reaches it.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
