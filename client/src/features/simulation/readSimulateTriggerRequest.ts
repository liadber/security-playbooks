import type { TriggerCode } from '@shared/types/playbook';
import type { SimulateTriggerRequest } from '@shared/types/simulation';
import { SIMULATION_FIELDS } from './simulation.constants';

/** The chosen trigger comes from the server's own options and is validated again there. */
export function readSimulateTriggerRequest(formData: FormData): SimulateTriggerRequest {
  return { trigger: String(formData.get(SIMULATION_FIELDS.trigger) ?? '') as TriggerCode };
}
