import type { Playbook, PlaybookOptions } from '@shared/types/playbook';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PlaybookList } from './PlaybookList';

const options: PlaybookOptions = {
  triggers: [
    { code: 'MALWARE_DETECTED', label: 'Malware Detected' },
    { code: 'LOGIN_ATTEMPT', label: 'Login Attempt' },
  ],
  actions: [
    { code: 'ISOLATE_HOST', label: 'Isolate Host' },
    { code: 'NOTIFY_ADMIN', label: 'Notify Admin' },
    { code: 'BLOCK_IP', label: 'Block IP' },
  ],
  nameMaxLength: 100,
};

const quarantine: Playbook = {
  id: 'p1',
  name: 'Quarantine',
  trigger: 'MALWARE_DETECTED',
  actions: ['ISOLATE_HOST', 'NOTIFY_ADMIN'],
};
const lockdown: Playbook = {
  id: 'p2',
  name: 'Lockdown',
  trigger: 'LOGIN_ATTEMPT',
  actions: ['BLOCK_IP'],
};

/** The card showing the named playbook. */
function card(name: string) {
  return within(screen.getByRole('heading', { name }).closest('article')!);
}

function renderList(playbooks: Playbook[], editingId: string | null = null) {
  const onEdit = vi.fn();
  const onDelete = vi.fn().mockResolvedValue(undefined);
  render(
    <PlaybookList
      playbooks={playbooks}
      options={options}
      editingId={editingId}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  );
  return { onEdit, onDelete };
}

describe('PlaybookList', () => {
  it('shows the empty state when there are no playbooks', () => {
    renderList([]);

    expect(screen.getByText(/no playbooks yet/)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows a card per playbook with its labels', () => {
    renderList([quarantine, lockdown]);

    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(['Quarantine', 'Lockdown']);
    expect(card('Quarantine').getByText('Trigger: Malware Detected')).toBeInTheDocument();
    expect(
      card('Quarantine').getByText('Actions: Isolate Host → Notify Admin'),
    ).toBeInTheDocument();
  });

  it('highlights only the card of the playbook being edited', () => {
    renderList([quarantine, lockdown], 'p2');

    const [first, second] = screen.getAllByRole('article');
    expect(second.className).not.toBe(first.className);
  });

  it('reports Edit with the playbook', async () => {
    const { onEdit } = renderList([quarantine, lockdown]);

    await userEvent.setup().click(card('Lockdown').getByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(lockdown);
  });

  it('reports a confirmed delete with the id', async () => {
    const { onDelete } = renderList([quarantine, lockdown]);
    const user = userEvent.setup();

    await user.click(card('Quarantine').getByRole('button', { name: 'Delete' }));
    await user.click(card('Quarantine').getByRole('button', { name: 'Confirm' }));

    expect(onDelete).toHaveBeenCalledWith('p1');
  });
});
