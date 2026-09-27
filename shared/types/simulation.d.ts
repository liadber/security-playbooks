import type { Playbook, TriggerCode } from './playbook.js';

/** The body of POST /simulateTrigger. */
export interface SimulateTriggerRequest {
  trigger: TriggerCode;
}

/** A playbook that would run; the trigger is omitted because it is the one simulated. */
export type SimulationMatch = Pick<Playbook, 'id' | 'name' | 'actions'>;

/** The response of POST /simulateTrigger; matches are sorted by name. */
export interface SimulationResult {
  trigger: TriggerCode;
  matches: SimulationMatch[];
}
