import type { Playbook, PlaybookOptions } from '@shared/types/playbook';
import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import { GENERIC_ERROR_MESSAGE } from '@/shared/forms/forms.constants';
import { actionLabels } from '@/shared/options/actionLabels';
import { codeLabel } from '@/shared/options/codeLabel';
import styles from './PlaybookCard.module.css';

type PlaybookCardProps = {
  playbook: Playbook;
  /** For the trigger and action labels; the card shows labels, never codes. */
  options: PlaybookOptions;
  /** True for the playbook currently in the edit form. */
  highlighted: boolean;
  onEdit: (playbook: Playbook) => void;
  /** Rejects when the server refuses; the card then shows the reason. */
  onDelete: (id: string) => Promise<void>;
};

export function PlaybookCard({
  playbook,
  options,
  highlighted,
  onEdit,
  onDelete,
}: PlaybookCardProps) {
  // Deletion is confirmed in place: no modal and no window.confirm, so the page stays in control.
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(playbook.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : GENERIC_ERROR_MESSAGE);
      setIsDeleting(false);
      setIsConfirming(false);
    }
  }

  return (
    <Card highlighted={highlighted}>
      <h3 className={styles.title}>{playbook.name}</h3>
      <p className={styles.meta}>Trigger: {codeLabel(options.triggers, playbook.trigger)}</p>
      <p className={styles.meta}>Actions: {actionLabels(options.actions, playbook.actions)}</p>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div className={styles.buttons}>
        {isConfirming ? (
          <>
            <span className={styles.question}>Delete this playbook?</span>
            <Button variant="secondary" pending={isDeleting} onClick={confirmDelete}>
              Confirm
            </Button>
            <Button variant="secondary" onClick={() => setIsConfirming(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => onEdit(playbook)}>
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setIsConfirming(true)}>
              Delete
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
