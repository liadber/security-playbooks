import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { TEST_CONFIG } from '../../shared/testing/test-config.js';
import { useTestDatabase } from '../../shared/testing/test-db.js';

describe('GET /health', () => {
  const app = createApp(TEST_CONFIG);
  useTestDatabase();

  it('returns ok and the database status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({ status: 'ok', db: 'connected' });
  });
});
