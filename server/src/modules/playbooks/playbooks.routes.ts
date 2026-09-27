import { Router } from 'express';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { validateBody } from '../../shared/middleware/validate.middleware.js';
import { assertAuthenticated, requireAuth } from '../auth/auth.middleware.js';
import type { TokenService } from '../auth/auth.types.js';
import { createPlaybookSchema, updatePlaybookSchema } from './playbooks.schemas.js';
import * as playbooks from './playbooks.service.js';
import type { PlaybookParams } from './playbooks.types.js';

export function createPlaybooksRouter(tokens: TokenService): Router {
  const router = Router();

  router.use(requireAuth(tokens));

  router.get('/options', (_req, res) => {
    res.json(playbooks.getPlaybookOptions());
  });

  router.get('/', async (req, res) => {
    assertAuthenticated(req);
    res.json(await playbooks.listPlaybooks(req.userId));
  });

  router.post('/', validateBody(createPlaybookSchema), async (req, res) => {
    assertAuthenticated(req);
    const created = await playbooks.createPlaybook(req.userId, req.body);
    res.status(HttpStatus.CREATED).json(created);
  });

  router.patch<PlaybookParams>('/:id', validateBody(updatePlaybookSchema), async (req, res) => {
    assertAuthenticated(req);
    res.json(await playbooks.updatePlaybook(req.userId, req.params.id, req.body));
  });

  router.delete<PlaybookParams>('/:id', async (req, res) => {
    assertAuthenticated(req);
    await playbooks.deletePlaybook(req.userId, req.params.id);
    res.status(HttpStatus.NO_CONTENT).end();
  });

  return router;
}
