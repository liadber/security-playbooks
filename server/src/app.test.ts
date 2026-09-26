import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { HttpStatus } from './shared/constants/http-status.constants.js';
import { TEST_CONFIG } from './shared/testing/test-config.js';

describe('app', () => {
  const app = createApp(TEST_CONFIG);

  it('does not advertise the framework in response headers', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.headers).not.toHaveProperty('x-powered-by');
  });

  describe('unknown routes', () => {
    it('returns a JSON 404 for an unknown path', async () => {
      const res = await request(app).get('/does-not-exist');

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toEqual({ error: 'Route not found' });
    });

    it('returns a JSON 404 for an unsupported method on a known path', async () => {
      const res = await request(app).delete('/health');

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toEqual({ error: 'Route not found' });
    });
  });
});
