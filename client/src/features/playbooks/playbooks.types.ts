import type { Playbook } from '@shared/types/playbook';
import type { PLAYBOOK_FORM_MODE } from './playbooks.constants';

export type PlaybookFormMode = (typeof PLAYBOOK_FORM_MODE)[keyof typeof PLAYBOOK_FORM_MODE];

/** What a saved form reports back: which playbook, and whether it was created or updated. */
export interface PlaybookSaved {
  name: string;
  mode: PlaybookFormMode;
}

/** The editing state of the playbooks page and the actions on it; see usePlaybookEditor. */
export interface PlaybookEditor {
  /** The playbook in the form, or null for an empty create form. */
  editing: Playbook | null;
  /** Changes whenever the form must start over; the page uses it as the form's React key. */
  formKey: string;
  /** What the last save did, until the next submit or Edit. */
  message: string | null;
  startEdit: (playbook: Playbook) => void;
  cancel: () => void;
  onSubmitStart: () => void;
  onSaved: (saved: PlaybookSaved) => void;
  /** Deletes; a playbook that is already gone counts as deleted. Rejects on any other failure. */
  remove: (id: string) => Promise<void>;
}
