import type TestAgent from 'supertest/lib/agent.js';

/** A supertest agent holding a user's session cookie, with that user's id. */
export interface LoggedInAgent {
  agent: TestAgent;
  userId: string;
}
