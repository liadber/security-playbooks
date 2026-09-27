import { MONGO_DUPLICATE_KEY_CODE } from './db.constants.js';

/** True for MongoDB's unique-index violation, which services answer with a 409. */
export function isDuplicateKeyError(err: unknown): boolean {
  return (err as { code?: number } | null)?.code === MONGO_DUPLICATE_KEY_CODE;
}
