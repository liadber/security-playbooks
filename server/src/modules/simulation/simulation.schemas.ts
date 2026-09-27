import type { SimulateTriggerRequest } from '@shared/types/simulation.js';
import { z } from 'zod';
import { TRIGGER_CODES } from '../playbooks/playbooks.constants.js';

/** `satisfies` ties the schema to the shared contract, like the auth and playbook schemas. */
export const simulateTriggerSchema = z.object({
  trigger: z.enum(TRIGGER_CODES, { error: 'Trigger must be one of the known triggers' }),
}) satisfies z.ZodType<SimulateTriggerRequest>;
