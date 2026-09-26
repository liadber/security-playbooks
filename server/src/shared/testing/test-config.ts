import type { Config } from '../../config/config.types.js';

/**
 * Passed straight to createApp(); tests never read environment variables.
 * mongodbUri is unused: the database comes from useTestDatabase().
 */
export const TEST_CONFIG: Config = {
  port: 0,
  mongodbUri: 'mongodb://localhost:27017/unused-in-tests',
  jwtSecret: 'test-secret',
  cookieSecure: false,
};
