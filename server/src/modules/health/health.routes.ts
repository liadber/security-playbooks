import { Router } from 'express';
import { getDatabaseStatus } from '../../shared/db/db.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', db: getDatabaseStatus() });
});
