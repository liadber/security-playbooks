import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/shared/testing/setup.ts'],
    passWithNoTests: true,
    // Mocks are reset between tests, so one test cannot affect another.
    mockReset: true,
  },
});
