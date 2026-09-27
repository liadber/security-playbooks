import type { PlaybookOptions } from '@shared/types/playbook';
import { request } from '@/shared/api/http';
import { PLAYBOOK_OPTIONS_ENDPOINT } from './options.constants';

/**
 * The trigger and action codes with their labels and the name length limit. The server is
 * their only source; the client never hard-codes a code, a label or the limit. Shared,
 * not part of the playbooks feature, because the simulation page needs them as well.
 */
export function getPlaybookOptions(): Promise<PlaybookOptions> {
  return request<PlaybookOptions>(PLAYBOOK_OPTIONS_ENDPOINT);
}
