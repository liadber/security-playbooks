import { Router } from 'express';
import { validateBody } from '../../shared/middleware/validate.middleware.js';
import { assertAuthenticated, requireAuth } from '../auth/auth.middleware.js';
import type { TokenService } from '../auth/auth.types.js';
import { simulateTriggerSchema } from './simulation.schemas.js';
import { simulateTrigger } from './simulation.service.js';

export function createSimulationRouter(tokens: TokenService): Router {
  const router = Router();

  router.use(requireAuth(tokens));

  router.post('/', validateBody(simulateTriggerSchema), async (req, res) => {
    assertAuthenticated(req);
    res.json(await simulateTrigger(req.userId, req.body.trigger));
  });

  return router;
}
