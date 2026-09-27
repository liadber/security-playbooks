import type { ActionCode, TriggerCode } from '@shared/types/playbook.js';

/** Display label per trigger code. The Record type fails typecheck if a code is missing or extra. */
export const TRIGGER_LABELS: Record<TriggerCode, string> = {
  MALWARE_DETECTED: 'Malware Detected',
  LOGIN_ATTEMPT: 'Login Attempt',
  PHISHING_ALERT: 'Phishing Alert',
};

/**
 * Display label per action code. The declaration order is the canonical order of actions:
 * playbooks store and return their actions in this order, whatever order a client sent.
 * The Record type fails typecheck if a code is missing or extra.
 */
export const ACTION_LABELS: Record<ActionCode, string> = {
  ISOLATE_HOST: 'Isolate Host',
  NOTIFY_ADMIN: 'Notify Admin',
  BLOCK_IP: 'Block IP',
};

export const TRIGGER_CODES = Object.keys(TRIGGER_LABELS) as TriggerCode[];
/** In canonical order (see ACTION_LABELS). */
export const ACTION_CODES = Object.keys(ACTION_LABELS) as ActionCode[];

export const PLAYBOOK_NAME_MAX_LENGTH = 100;
export const PLAYBOOK_MIN_ACTIONS = 1;
export const PLAYBOOK_MAX_ACTIONS = 3;

/**
 * How playbook names are compared for uniqueness and sorting: strength 2 compares letters
 * and accents but ignores case, so "Phishing" and "phishing" are the same name.
 */
export const NAME_COLLATION = { locale: 'en', strength: 2 } as const;

/** Messages of the errors this module answers with; the client shows them as they are. */
export const PLAYBOOK_ERRORS = {
  NOT_FOUND: 'Playbook not found',
  NAME_TAKEN: 'A playbook with this name already exists',
} as const;
