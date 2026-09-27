import type { TriggerCode } from '@shared/types/playbook';
import type { SimulateTriggerRequest, SimulationResult } from '@shared/types/simulation';
import { request } from '@/shared/api/http';
import { SIMULATE_ENDPOINT } from './simulation.constants';

/** Which of the user's playbooks would run for the trigger; nothing is stored. */
export function simulateTrigger(trigger: TriggerCode): Promise<SimulationResult> {
  const body: SimulateTriggerRequest = { trigger };
  return request<SimulationResult>(SIMULATE_ENDPOINT, { method: 'POST', body });
}
