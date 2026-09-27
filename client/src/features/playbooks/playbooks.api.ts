import type { Playbook, PlaybookInput } from '@shared/types/playbook';
import { request } from '@/shared/api/http';
import { PLAYBOOKS_ENDPOINT } from './playbooks.constants';

/** The user's playbooks in the server's order (sorted by name). */
export function listPlaybooks(): Promise<Playbook[]> {
  return request<Playbook[]>(PLAYBOOKS_ENDPOINT);
}

export function createPlaybook(input: PlaybookInput): Promise<Playbook> {
  return request<Playbook>(PLAYBOOKS_ENDPOINT, { method: 'POST', body: input });
}

/** Sends every field; the server accepts any subset, so a full form is a valid PATCH. */
export function updatePlaybook(id: string, input: PlaybookInput): Promise<Playbook> {
  return request<Playbook>(`${PLAYBOOKS_ENDPOINT}/${id}`, { method: 'PATCH', body: input });
}

export function deletePlaybook(id: string): Promise<void> {
  return request<void>(`${PLAYBOOKS_ENDPOINT}/${id}`, { method: 'DELETE' });
}
