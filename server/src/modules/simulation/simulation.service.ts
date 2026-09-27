import type { TriggerCode } from '@shared/types/playbook.js';
import type { SimulationResult } from '@shared/types/simulation.js';
import { findPlaybooksByTrigger } from '../playbooks/playbooks.service.js';

/** Which of the user's playbooks would run for a trigger. Nothing is stored. */
export async function simulateTrigger(
  userId: string,
  trigger: TriggerCode,
): Promise<SimulationResult> {
  const playbooks = await findPlaybooksByTrigger(userId, trigger);
  return {
    trigger,
    matches: playbooks.map(({ id, name, actions }) => ({ id, name, actions })),
  };
}
