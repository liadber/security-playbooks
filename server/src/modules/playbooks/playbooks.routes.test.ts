import { Types } from 'mongoose';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { loggedInAgent } from '../../shared/testing/test-agent.js';
import { TEST_CONFIG } from '../../shared/testing/test-config.js';
import { useTestDatabase } from '../../shared/testing/test-db.js';
import { PLAYBOOK_NAME_MAX_LENGTH } from './playbooks.constants.js';

const app = createApp(TEST_CONFIG);
useTestDatabase();

const alice = { email: 'alice@example.com', password: 'correct-horse' };
const bob = { email: 'bob@example.com', password: 'correct-horse' };

const input = {
  name: 'Quarantine on malware',
  trigger: 'MALWARE_DETECTED',
  actions: ['NOTIFY_ADMIN', 'ISOLATE_HOST'],
};

const missingId = new Types.ObjectId().toHexString();

describe('without a session', () => {
  it.each([
    ['get', '/playbooks'],
    ['get', '/playbooks/options'],
    ['post', '/playbooks'],
    ['patch', `/playbooks/${missingId}`],
    ['delete', `/playbooks/${missingId}`],
  ] as const)('%s %s returns 401', async (method, path) => {
    const res = await request(app)[method](path).send(input);

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toEqual({ error: 'Missing or invalid token' });
  });
});

describe('GET /playbooks/options', () => {
  it('returns the triggers, the actions in canonical order and the name limit', async () => {
    const { agent } = await loggedInAgent(app, alice);

    const res = await agent.get('/playbooks/options');

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({
      triggers: [
        { code: 'MALWARE_DETECTED', label: 'Malware Detected' },
        { code: 'LOGIN_ATTEMPT', label: 'Login Attempt' },
        { code: 'PHISHING_ALERT', label: 'Phishing Alert' },
      ],
      actions: [
        { code: 'ISOLATE_HOST', label: 'Isolate Host' },
        { code: 'NOTIFY_ADMIN', label: 'Notify Admin' },
        { code: 'BLOCK_IP', label: 'Block IP' },
      ],
      nameMaxLength: PLAYBOOK_NAME_MAX_LENGTH,
    });
  });
});

describe('POST /playbooks', () => {
  it('returns 201 with the playbook, its actions in canonical order and nothing else', async () => {
    const { agent } = await loggedInAgent(app, alice);

    const res = await agent.post('/playbooks').send(input);

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toEqual({
      id: expect.any(String),
      name: input.name,
      trigger: input.trigger,
      actions: ['ISOLATE_HOST', 'NOTIFY_ADMIN'],
    });
    expect(Object.keys(res.body).sort()).toEqual(['actions', 'id', 'name', 'trigger']);
  });

  it('trims the name', async () => {
    const { agent } = await loggedInAgent(app, alice);

    const res = await agent.post('/playbooks').send({ ...input, name: '  Padded  ' });

    expect(res.body.name).toBe('Padded');
  });

  it.each([
    ['an empty name', { name: '' }, { name: 'Name is required' }],
    [
      'a name over the limit',
      { name: 'x'.repeat(PLAYBOOK_NAME_MAX_LENGTH + 1) },
      { name: `Must be at most ${PLAYBOOK_NAME_MAX_LENGTH} characters` },
    ],
    [
      'an unknown trigger',
      { trigger: 'EARTHQUAKE' },
      { trigger: 'Trigger must be one of the known triggers' },
    ],
    ['no actions', { actions: [] }, { actions: 'Choose at least 1 action' }],
    [
      'four actions',
      { actions: ['ISOLATE_HOST', 'NOTIFY_ADMIN', 'BLOCK_IP', 'ISOLATE_HOST'] },
      { actions: 'Choose at most 3 actions' },
    ],
    [
      'a repeated action',
      { actions: ['BLOCK_IP', 'BLOCK_IP'] },
      { actions: 'Actions must not repeat' },
    ],
  ])('returns 400 with a field message for %s', async (_label, override, fields) => {
    const { agent } = await loggedInAgent(app, alice);

    const res = await agent.post('/playbooks').send({ ...input, ...override });

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({ error: 'Validation failed', fields });
  });

  it('returns 409 for a name the user already has, whatever the case', async () => {
    const { agent } = await loggedInAgent(app, alice);
    await agent.post('/playbooks').send({ ...input, name: 'Phishing' });

    const sameCase = await agent.post('/playbooks').send({ ...input, name: 'Phishing' });
    const otherCase = await agent.post('/playbooks').send({ ...input, name: 'phishing' });

    expect(sameCase.status).toBe(HttpStatus.CONFLICT);
    expect(otherCase.status).toBe(HttpStatus.CONFLICT);
    expect(otherCase.body).toEqual({ error: 'A playbook with this name already exists' });
  });

  it('lets another user use the same name', async () => {
    const { agent: asAlice } = await loggedInAgent(app, alice);
    const { agent: asBob } = await loggedInAgent(app, bob);
    await asAlice.post('/playbooks').send({ ...input, name: 'Phishing' });

    const res = await asBob.post('/playbooks').send({ ...input, name: 'Phishing' });

    expect(res.status).toBe(HttpStatus.CREATED);
  });
});

describe('GET /playbooks', () => {
  it("returns only the user's playbooks, sorted by name case-insensitively", async () => {
    const { agent: asAlice } = await loggedInAgent(app, alice);
    const { agent: asBob } = await loggedInAgent(app, bob);
    for (const name of ['banana', 'Cherry', 'apple']) {
      await asAlice.post('/playbooks').send({ ...input, name });
    }
    await asBob.post('/playbooks').send({ ...input, name: 'Aardvark' });

    const res = await asAlice.get('/playbooks');

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body.map((playbook: { name: string }) => playbook.name)).toEqual([
      'apple',
      'banana',
      'Cherry',
    ]);
  });

  it('returns an empty list for a user without playbooks', async () => {
    const { agent } = await loggedInAgent(app, alice);

    const res = await agent.get('/playbooks');

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual([]);
  });
});

describe('PATCH /playbooks/:id', () => {
  it('updates a single field and returns the whole playbook', async () => {
    const { agent } = await loggedInAgent(app, alice);
    const { body: created } = await agent.post('/playbooks').send(input);

    const res = await agent.patch(`/playbooks/${created.id}`).send({ name: 'Renamed' });

    expect(res.status).toBe(HttpStatus.OK);
    expect(res.body).toEqual({ ...created, name: 'Renamed' });
  });

  it('stores updated actions in canonical order', async () => {
    const { agent } = await loggedInAgent(app, alice);
    const { body: created } = await agent.post('/playbooks').send(input);

    const res = await agent
      .patch(`/playbooks/${created.id}`)
      .send({ actions: ['BLOCK_IP', 'ISOLATE_HOST'] });

    expect(res.body.actions).toEqual(['ISOLATE_HOST', 'BLOCK_IP']);
  });

  it('returns 400 for an empty body', async () => {
    const { agent } = await loggedInAgent(app, alice);
    const { body: created } = await agent.post('/playbooks').send(input);

    const res = await agent.patch(`/playbooks/${created.id}`).send({});

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toEqual({
      error: 'Validation failed',
      fields: { body: 'At least one field is required' },
    });
  });

  it('returns 409 when renaming to a name the user already has, whatever the case', async () => {
    const { agent } = await loggedInAgent(app, alice);
    await agent.post('/playbooks').send({ ...input, name: 'Phishing' });
    const { body: other } = await agent.post('/playbooks').send({ ...input, name: 'Other' });

    const res = await agent.patch(`/playbooks/${other.id}`).send({ name: 'PHISHING' });

    expect(res.status).toBe(HttpStatus.CONFLICT);
    expect(res.body).toEqual({ error: 'A playbook with this name already exists' });
  });

  it('accepts a playbook keeping its own name', async () => {
    const { agent } = await loggedInAgent(app, alice);
    const { body: created } = await agent.post('/playbooks').send(input);

    const res = await agent.patch(`/playbooks/${created.id}`).send({ name: input.name });

    expect(res.status).toBe(HttpStatus.OK);
  });

  it.each([
    ['another user’s playbook', 'other'],
    ['a missing id', 'missing'],
    ['an id that is not an ObjectId', 'invalid'],
  ] as const)('returns 404 for %s', async (_label, kind) => {
    const { agent: asAlice } = await loggedInAgent(app, alice);
    const { agent: asBob } = await loggedInAgent(app, bob);
    const { body: bobs } = await asBob.post('/playbooks').send(input);
    const id = { other: bobs.id, missing: missingId, invalid: 'not-an-id' }[kind];

    const res = await asAlice.patch(`/playbooks/${id}`).send({ name: 'Renamed' });

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expect(res.body).toEqual({ error: 'Playbook not found' });
  });
});

describe('DELETE /playbooks/:id', () => {
  it('returns 204 and removes the playbook', async () => {
    const { agent } = await loggedInAgent(app, alice);
    const { body: created } = await agent.post('/playbooks').send(input);

    const res = await agent.delete(`/playbooks/${created.id}`);

    expect(res.status).toBe(HttpStatus.NO_CONTENT);
    expect((await agent.get('/playbooks')).body).toEqual([]);
  });

  it.each([
    ['another user’s playbook', 'other'],
    ['a missing id', 'missing'],
    ['an id that is not an ObjectId', 'invalid'],
  ] as const)('returns 404 for %s and deletes nothing', async (_label, kind) => {
    const { agent: asAlice } = await loggedInAgent(app, alice);
    const { agent: asBob } = await loggedInAgent(app, bob);
    const { body: bobs } = await asBob.post('/playbooks').send(input);
    const id = { other: bobs.id, missing: missingId, invalid: 'not-an-id' }[kind];

    const res = await asAlice.delete(`/playbooks/${id}`);

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
    expect(res.body).toEqual({ error: 'Playbook not found' });
    expect((await asBob.get('/playbooks')).body).toHaveLength(1);
  });
});
