/** The event a playbook reacts to. The server maps each code to its display label. */
export type TriggerCode = 'MALWARE_DETECTED' | 'LOGIN_ATTEMPT' | 'PHISHING_ALERT';

/** An action a playbook runs. The server maps each code to its display label. */
export type ActionCode = 'ISOLATE_HOST' | 'NOTIFY_ADMIN' | 'BLOCK_IP';

/** The body of POST /playbooks; PATCH /playbooks/:id takes any subset of it. */
export interface PlaybookInput {
  name: string;
  trigger: TriggerCode;
  /** In the server's canonical order in every response, whatever order was sent. */
  actions: ActionCode[];
}

/** A playbook as the API returns it: the input fields plus the id. */
export interface Playbook extends PlaybookInput {
  id: string;
}

/** A selectable code with the text to show for it. */
export interface CodeOption<Code extends string> {
  code: Code;
  label: string;
}

/** The response of GET /playbooks/options: everything a form needs to build a playbook. */
export interface PlaybookOptions {
  triggers: CodeOption<TriggerCode>[];
  /** In canonical order. */
  actions: CodeOption<ActionCode>[];
  nameMaxLength: number;
}
