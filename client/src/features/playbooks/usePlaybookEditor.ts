import type { Playbook } from '@shared/types/playbook';
import { useState } from 'react';
import { ApiError } from '@/shared/api/api-error';
import { HttpStatus } from '@/shared/api/api.constants';
import { FIRST_FORM_KEY, PLAYBOOK_FORM_MODE } from './playbooks.constants';
import { deletePlaybook } from './playbooks.api';
import type { PlaybookEditor, PlaybookSaved } from './playbooks.types';

/**
 * The editing state of the playbooks page: which playbook is in the form, when the form must
 * start over, the message after a save, and the actions the form and the list report. The
 * page passes onChange, called after every change the server accepted, to reload the list.
 */
export function usePlaybookEditor(onChange: () => void): PlaybookEditor {
  const [editing, setEditing] = useState<Playbook | null>(null);
  const [resetCount, setResetCount] = useState(FIRST_FORM_KEY);
  const [message, setMessage] = useState<string | null>(null);

  /** Leaves edit mode with a new form key, so the form remounts empty whatever was typed. */
  function reset() {
    setEditing(null);
    setResetCount((count) => count + 1);
  }

  function startEdit(playbook: Playbook) {
    setMessage(null);
    setEditing(playbook);
  }

  function onSubmitStart() {
    setMessage(null);
  }

  function onSaved({ name, mode }: PlaybookSaved) {
    const verb = mode === PLAYBOOK_FORM_MODE.EDIT ? 'updated' : 'created';
    setMessage(`Playbook "${name}" ${verb}`);
    reset();
    onChange();
  }

  async function remove(id: string) {
    try {
      await deletePlaybook(id);
    } catch (error) {
      // A playbook that is already gone (deleted in another tab, say) needs no error: the reload
      // removes its stale card. Any other failure is the caller's to show.
      const alreadyGone = error instanceof ApiError && error.status === HttpStatus.NOT_FOUND;
      if (!alreadyGone) throw error;
    }
    if (editing?.id === id) reset();
    onChange();
  }

  return {
    editing,
    formKey: editing ? `edit-${editing.id}` : `create-${resetCount}`,
    message,
    startEdit,
    cancel: reset,
    onSubmitStart,
    onSaved,
    remove,
  };
}
