export const PLAYBOOKS_ROUTE = '/playbooks';
export const PLAYBOOKS_ENDPOINT = '/playbooks';

/** Form field names; they double as the keys of the server's field errors. */
export const PLAYBOOK_FIELDS = {
  name: 'name',
  trigger: 'trigger',
  actions: 'actions',
} as const;

export const PLAYBOOK_FORM_MODE = {
  CREATE: 'create',
  EDIT: 'edit',
} as const;

/** The create form's first React key; the page counts up to remount an empty form. */
export const FIRST_FORM_KEY = 0;
