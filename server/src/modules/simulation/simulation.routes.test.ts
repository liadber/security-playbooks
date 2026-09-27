import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { loggedInAgent } from '../../shared/testing/test-agent.js';
import { TEST_CONFIG } from '../../shared/testing/test-config.js';
import { useTestDatabase } from '../../shared/testing/test-db.js';

const app = createApp(TEST_CONFIG);
useTestDatabase();

const alice = { email: 'alice@example.com', password: 'correct-horse' };
const bob = { email: 'bob@example.com', password: 'correct-horse' };

const malware = (name: string) => ({ name, trigger: 'MALWARE_DETECTED', actions: ['BLOCK_IP'] });
const phishing = (name: string) => ({ name, trigger: 'PHISHING_ALERT', actions: ['NOTIFY_ADMIN'] });

describe('POST /simulateTrigger', () => {
  it('returns 401 without a session', async () => {
    const res = await request(app).post('/simulateTrigger').send({ trigger: 'MALWARE_DETECTED' });

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: 'Missing or invalid token' });
  });

  it.each([
    ['an unknown trigger', { trigger: 'EARTHQUAKE' }],
    ['a missing trigger', {}],
  ])('returns 400 for %s', async (_label, body) => {
    const { agent } = await loggedInAgent(app, alice);

    const res = await agent.post('/simulateTrigger').send(body);

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      error: 'Validation failed',
      fields: { trigger: 'Trigger must be one of the known triggers' },
    });
  });

  it("returns the user's playbooks for that trigger, sorted by name", async () => {
    const { agent } = await loggedInAgent(app, alice);
    const { body: second } = await agent.post('/playbooks').send(malware('beta response'));
    const { body: first } = await agent.post('/playbooks').send(malware('Alpha response'));
    await agent.post('/playbooks').send(phishing('Not this one'));

    const res = await agent.post('/simulateTrigger').send({ trigger: 'MALWARE_DETECTED' });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({
      trigger: 'MALWARE_DETECTED',
      matches: [
        { id: first.id, name: 'Alpha response', actions: ['BLOCK_IP'] },
        { id: second.id, name: 'beta response', actions: ['BLOCK_IP'] },
      ],
    });
  });

  it("never includes another user's playbooks", async () => {
    const { agent: asAlice } = await loggedInAgent(app, alice);
    const { agent: asBob } = await loggedInAgent(app, bob);
    await asBob.post('/playbooks').send(malware('Bob only'));

    const res = await asAlice.post('/simulateTrigger').send({ trigger: 'MALWARE_DETECTED' });

    expect(res.body.matches).toEqual([]);
  });

  it('returns 200 with an empty list when nothing matches', async () => {
    const { agent } = await loggedInAgent(app, alice);
    await agent.post('/playbooks').send(phishing('Phishing only'));

    const res = await agent.post('/simulateTrigger').send({ trigger: 'LOGIN_ATTEMPT' });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({ trigger: 'LOGIN_ATTEMPT', matches: [] });
  });

  it('stores nothing', async () => {
    const { agent } = await loggedInAgent(app, alice);
    await agent.post('/playbooks').send(malware('Only one'));

    await agent.post('/simulateTrigger').send({ trigger: 'MALWARE_DETECTED' });

    expect((await agent.get('/playbooks')).body).toHaveLength(1);
  });
});
