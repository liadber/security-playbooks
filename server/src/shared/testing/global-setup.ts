import { MongoMemoryServer } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

/**
 * Runs once per test run, before any test file: starts a single in-memory MongoDB
 * and shares its URI with the test files (see useTestDatabase).
 */
export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const server = await MongoMemoryServer.create();
  project.provide('mongoUri', server.getUri());

  return async () => {
    await server.stop();
  };
}
