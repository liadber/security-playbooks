import type { Credentials } from '@shared/types/auth.js';
import type { Express } from 'express';
import request from 'supertest';
import type { LoggedInAgent } from './testing.types.js';

/**
 * Registers the user and logs in on a supertest agent, which keeps the auth cookie
 * between requests like a browser, so protected routes can be called as that user.
 */
export async function loggedInAgent(
  app: Express,
  credentials: Credentials,
): Promise<LoggedInAgent> {
  const agent = request.agent(app);
  const registered = await agent.post('/auth/register').send(credentials);
  await agent.post('/auth/login').send(credentials);
  return { agent, userId: registered.body.id as string };
}
