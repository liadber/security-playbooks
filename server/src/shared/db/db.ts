import mongoose from 'mongoose';
import { DB_CONNECTION_TIMEOUT_MS } from './db.constants.js';
import type { DbStatus } from './db.types.js';

export async function connectToDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: DB_CONNECTION_TIMEOUT_MS });
}

export function getDatabaseStatus(): DbStatus {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected
    ? 'connected'
    : 'disconnected';
}
