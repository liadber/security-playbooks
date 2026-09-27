import type { ActionCode, PlaybookInput, TriggerCode } from '@shared/types/playbook';
import { PLAYBOOK_FIELDS } from './playbooks.constants';

/**
 * The form's values as the API body. The select and checkbox values come from the
 * server's own options, and the server validates the body again, so the casts to the
 * code types are safe.
 */
export function readPlaybookInput(formData: FormData): PlaybookInput {
  return {
    name: String(formData.get(PLAYBOOK_FIELDS.name) ?? ''),
    trigger: String(formData.get(PLAYBOOK_FIELDS.trigger) ?? '') as TriggerCode,
    actions: formData.getAll(PLAYBOOK_FIELDS.actions).map(String) as ActionCode[],
  };
}
