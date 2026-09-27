import { describe, expect, it } from 'vitest';
import { PLAYBOOK_NAME_MAX_LENGTH } from './playbooks.constants.js';
import { createPlaybookSchema, updatePlaybookSchema } from './playbooks.schemas.js';

const valid = {
  name: 'Quarantine on malware',
  trigger: 'MALWARE_DETECTED',
  actions: ['ISOLATE_HOST', 'NOTIFY_ADMIN'],
};

/** Maps zod issues to { field: message } the same way the validation middleware does: first issue per field wins. */
function fieldErrors(result: { success: boolean; error?: { issues: unknown[] } }) {
  if (result.success || !result.error) return {};
  const issues = result.error.issues as { path: PropertyKey[]; message: string }[];
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    fields[issue.path.join('.') || 'body'] ??= issue.message;
  }
  return fields;
}

describe('createPlaybookSchema', () => {
  it('accepts a valid playbook and trims the name', () => {
    const result = createPlaybookSchema.safeParse({ ...valid, name: '  Quarantine  ' });

    expect(result.success && result.data.name).toBe('Quarantine');
  });

  it('rejects an empty or blank name', () => {
    expect(fieldErrors(createPlaybookSchema.safeParse({ ...valid, name: '' }))).toEqual({
      name: 'Name is required',
    });
    expect(fieldErrors(createPlaybookSchema.safeParse({ ...valid, name: '   ' }))).toEqual({
      name: 'Name is required',
    });
  });

  it('rejects a name over the maximum length', () => {
    const name = 'x'.repeat(PLAYBOOK_NAME_MAX_LENGTH + 1);

    expect(fieldErrors(createPlaybookSchema.safeParse({ ...valid, name }))).toEqual({
      name: `Must be at most ${PLAYBOOK_NAME_MAX_LENGTH} characters`,
    });
  });

  it('rejects an unknown trigger', () => {
    const result = createPlaybookSchema.safeParse({ ...valid, trigger: 'EARTHQUAKE' });

    expect(fieldErrors(result)).toEqual({ trigger: 'Trigger must be one of the known triggers' });
  });

  it('rejects an empty action list', () => {
    const result = createPlaybookSchema.safeParse({ ...valid, actions: [] });

    expect(fieldErrors(result)).toEqual({ actions: 'Choose at least 1 action' });
  });

  it('rejects more than three actions', () => {
    const actions = ['ISOLATE_HOST', 'NOTIFY_ADMIN', 'BLOCK_IP', 'ISOLATE_HOST'];
    const result = createPlaybookSchema.safeParse({ ...valid, actions });

    expect(fieldErrors(result).actions).toBe('Choose at most 3 actions');
  });

  it('rejects a repeated action instead of dropping it', () => {
    const result = createPlaybookSchema.safeParse({
      ...valid,
      actions: ['ISOLATE_HOST', 'ISOLATE_HOST'],
    });

    expect(fieldErrors(result)).toEqual({ actions: 'Actions must not repeat' });
  });

  it('rejects an unknown action', () => {
    const result = createPlaybookSchema.safeParse({ ...valid, actions: ['REBOOT'] });

    expect(fieldErrors(result)).toEqual({ 'actions.0': 'Actions must be known actions' });
  });

  it('reports every missing field as required', () => {
    expect(fieldErrors(createPlaybookSchema.safeParse({}))).toEqual({
      name: 'Name is required',
      trigger: 'Trigger must be one of the known triggers',
      actions: 'Actions are required',
    });
  });
});

describe('updatePlaybookSchema', () => {
  it('accepts a single field', () => {
    expect(updatePlaybookSchema.safeParse({ name: 'Renamed' }).success).toBe(true);
    expect(updatePlaybookSchema.safeParse({ actions: ['BLOCK_IP'] }).success).toBe(true);
  });

  it('rejects an empty update', () => {
    expect(fieldErrors(updatePlaybookSchema.safeParse({}))).toEqual({
      body: 'At least one field is required',
    });
  });

  it('applies the same rules as creation to the fields it receives', () => {
    expect(fieldErrors(updatePlaybookSchema.safeParse({ name: '' }))).toEqual({
      name: 'Name is required',
    });
    expect(
      fieldErrors(updatePlaybookSchema.safeParse({ actions: ['BLOCK_IP', 'BLOCK_IP'] })),
    ).toEqual({
      actions: 'Actions must not repeat',
    });
  });
});
