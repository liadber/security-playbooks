import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

const DEFAULT_SERVER_PORT = 4000;
/** Only /api/ at the start of the path; kept in sync with API_BASE_PATH in src/shared/api. */
const API_PREFIX_PATTERN = /^\/api\//;
const API_PREFIX_KEY = '^/api/';

export default defineConfig(({ mode }) => {
  // The empty prefix loads unprefixed variables too; they stay in this config and are
  // never exposed to browser code, which only VITE_-prefixed variables are.
  const env = loadEnv(mode, process.cwd(), '');
  const serverPort = Number(env.SERVER_PORT) || DEFAULT_SERVER_PORT;

  return {
    plugins: [react()],
    server: {
      // Forwards /api/* to the API server with the prefix removed, so the browser only
      // talks to one origin and the auth cookie is first-party.
      proxy: {
        [API_PREFIX_KEY]: {
          target: `http://localhost:${serverPort}`,
          rewrite: (path) => path.replace(API_PREFIX_PATTERN, '/'),
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['src/shared/testing/setup.ts'],
      passWithNoTests: true,
      // Mocks are reset between tests, so one test cannot affect another.
      mockReset: true,
    },
  };
});
