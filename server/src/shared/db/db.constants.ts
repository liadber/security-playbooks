/** Mongoose waits 30s by default; fail faster when the server is unreachable. */
export const DB_CONNECTION_TIMEOUT_MS = 5000;

/** MongoDB's error code for a unique-index violation. */
export const MONGO_DUPLICATE_KEY_CODE = 11000;
