import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { afterAll, afterEach, beforeAll, inject } from 'vitest';
import { connectToDatabase } from '../db/db.js';

/**
 * Connects the calling test file to the in-memory MongoDB from the global setup.
 * Test files run in parallel, so each gets its own database; it is wiped after every
 * test and dropped at the end.
 */
export function useTestDatabase(): void {
  beforeAll(async () => {
    const uri = new URL(inject('mongoUri'));
    uri.pathname = `/test-${randomUUID()}`;
    await connectToDatabase(uri.href);
  });

  afterEach(async () => {
    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });
}
