import type { Playbook, PlaybookOptions } from '@shared/types/playbook';
import { PlaybookCard } from '@/features/playbooks/PlaybookCard';
import { CardList } from '@/shared/components/CardList';
import { EmptyState } from '@/shared/components/EmptyState';

type PlaybookListProps = {
  playbooks: Playbook[];
  /** For the labels on the cards. */
  options: PlaybookOptions;
  /** The playbook in the edit form, whose card is highlighted; null while creating. */
  editingId: string | null;
  onEdit: (playbook: Playbook) => void;
  /** Rejects when the server refuses; the card then shows the reason. */
  onDelete: (id: string) => Promise<void>;
};

/** The user's playbooks as cards, or the empty state. It knows nothing about the editor. */
export function PlaybookList({
  playbooks,
  options,
  editingId,
  onEdit,
  onDelete,
}: PlaybookListProps) {
  if (playbooks.length === 0) {
    return <EmptyState>You have no playbooks yet. Create the first one with the form.</EmptyState>;
  }

  return (
    <CardList>
      {playbooks.map((playbook) => (
        <li key={playbook.id}>
          <PlaybookCard
            playbook={playbook}
            options={options}
            highlighted={playbook.id === editingId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </CardList>
  );
}
