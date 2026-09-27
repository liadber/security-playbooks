import type { PlaybookInput } from '@shared/types/playbook.js';
import { z } from 'zod';
import {
  ACTION_CODES,
  PLAYBOOK_MAX_ACTIONS,
  PLAYBOOK_MIN_ACTIONS,
  PLAYBOOK_NAME_MAX_LENGTH,
  TRIGGER_CODES,
} from './playbooks.constants.js';

const name = z
  .string({ error: 'Name is required' })
  .trim()
  .nonempty('Name is required')
  .max(PLAYBOOK_NAME_MAX_LENGTH, `Must be at most ${PLAYBOOK_NAME_MAX_LENGTH} characters`);

const trigger = z.enum(TRIGGER_CODES, { error: 'Trigger must be one of the known triggers' });

/**
 * A repeated action is an error rather than silently dropped: the client sends checkboxes,
 * so a duplicate means a bug or a hand-made request, and the server does not trust either.
 */
const actions = z
  .array(z.enum(ACTION_CODES, { error: 'Actions must be known actions' }), {
    error: 'Actions are required',
  })
  .min(PLAYBOOK_MIN_ACTIONS, `Choose at least ${PLAYBOOK_MIN_ACTIONS} action`)
  .max(PLAYBOOK_MAX_ACTIONS, `Choose at most ${PLAYBOOK_MAX_ACTIONS} actions`)
  .refine((codes) => new Set(codes).size === codes.length, 'Actions must not repeat');

/**
 * `satisfies` ties the schema to the shared contract: if it drifts from PlaybookInput,
 * typecheck fails here rather than at runtime on the client.
 */
export const createPlaybookSchema = z.object({
  name,
  trigger,
  actions,
}) satisfies z.ZodType<PlaybookInput>;

/** Any subset of the create fields, but never an empty update. */
export const updatePlaybookSchema = createPlaybookSchema
  .partial()
  .refine(
    (fields) => Object.keys(fields).length > 0,
    'At least one field is required',
  ) satisfies z.ZodType<Partial<PlaybookInput>>;
