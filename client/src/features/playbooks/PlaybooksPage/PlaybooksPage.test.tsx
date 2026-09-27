import type { Playbook, PlaybookOptions } from '@shared/types/playbook';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/app/app.test-utils';
import * as authApi from '@/features/auth/auth.api';
import * as playbooksApi from '@/features/playbooks/playbooks.api';
import { PLAYBOOKS_ROUTE } from '@/features/playbooks/playbooks.constants';
import { ApiError } from '@/shared/api/api-error';
import * as optionsApi from '@/shared/options/options.api';

vi.mock('@/features/auth/auth.api');
vi.mock('@/shared/options/options.api');
vi.mock('@/features/playbooks/playbooks.api');

const alice = { id: '1', email: 'alice@example.com' };

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

beforeEach(() => {
  vi.mocked(authApi.me).mockResolvedValue(alice);
  vi.mocked(optionsApi.getPlaybookOptions).mockResolvedValue(options);
  vi.mocked(playbooksApi.listPlaybooks).mockResolvedValue([quarantine, lockdown]);
});

/** The card showing the named playbook. */
function card(name: string) {
  const heading = screen.getByRole('heading', { name });
  return within(heading.closest('article')!);
}

async function fillForm(name: string, triggerLabel: string, actionLabels: string[]) {
  const user = userEvent.setup();
  const nameInput = screen.getByLabelText('Name');
  await user.clear(nameInput);
  await user.type(nameInput, name);
  await user.selectOptions(screen.getByLabelText('Trigger'), triggerLabel);
  for (const label of actionLabels) {
    await user.click(screen.getByLabelText(label));
  }
}

/** Opens the delete confirmation on the named card and confirms it. */
async function deleteCard(name: string) {
  const user = userEvent.setup();
  await user.click(card(name).getByRole('button', { name: 'Delete' }));
  await user.click(card(name).getByRole('button', { name: 'Confirm' }));
}

describe('PlaybooksPage', () => {
  it('shows a loading state, then the playbooks with their labels', async () => {
    renderApp(PLAYBOOKS_ROUTE);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Quarantine' })).toBeInTheDocument();
    expect(card('Quarantine').getByText('Trigger: Malware Detected')).toBeInTheDocument();
    expect(
      card('Quarantine').getByText('Actions: Isolate Host → Notify Admin'),
    ).toBeInTheDocument();
    expect(card('Lockdown').getByText('Actions: Block IP')).toBeInTheDocument();
  });

  it('shows the error with a retry button that loads again', async () => {
    vi.mocked(playbooksApi.listPlaybooks)
      .mockRejectedValueOnce(new ApiError(500, 'Internal server error'))
      .mockResolvedValueOnce([quarantine]);
    renderApp(PLAYBOOKS_ROUTE);
    expect(await screen.findByText('Internal server error')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('heading', { name: 'Quarantine' })).toBeInTheDocument();
    expect(playbooksApi.listPlaybooks).toHaveBeenCalledTimes(2);
  });

  it('shows an empty state when the user has no playbooks', async () => {
    vi.mocked(playbooksApi.listPlaybooks).mockResolvedValue([]);
    renderApp(PLAYBOOKS_ROUTE);

    expect(await screen.findByText(/no playbooks yet/)).toBeInTheDocument();
  });

  it('creates a playbook, shows the success message and reloads the list', async () => {
    const created: Playbook = { ...quarantine, id: 'p3', name: 'Phishing response' };
    vi.mocked(playbooksApi.createPlaybook).mockResolvedValue(created);
    vi.mocked(playbooksApi.listPlaybooks)
      .mockResolvedValueOnce([quarantine, lockdown])
      .mockResolvedValueOnce([lockdown, created, quarantine]);
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });

    await fillForm('Phishing response', 'Malware Detected', ['Notify Admin', 'Isolate Host']);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Create playbook' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Playbook "Phishing response" created',
    );
    expect(playbooksApi.createPlaybook).toHaveBeenCalledWith({
      name: 'Phishing response',
      trigger: 'MALWARE_DETECTED',
      actions: ['ISOLATE_HOST', 'NOTIFY_ADMIN'],
    });
    expect(await screen.findByRole('heading', { name: 'Phishing response' })).toBeInTheDocument();
    expect(playbooksApi.listPlaybooks).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows a 409 under the name field and keeps every value', async () => {
    vi.mocked(playbooksApi.createPlaybook).mockRejectedValue(
      new ApiError(409, 'Validation failed', { name: 'A playbook with this name already exists' }),
    );
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });

    await fillForm('Quarantine', 'Login Attempt', ['Block IP', 'Isolate Host']);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Create playbook' }));

    expect(await screen.findByText('A playbook with this name already exists')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Quarantine');
    expect(screen.getByLabelText('Trigger')).toHaveValue('LOGIN_ATTEMPT');
    expect(screen.getByLabelText('Block IP')).toBeChecked();
    expect(screen.getByLabelText('Isolate Host')).toBeChecked();
    expect(screen.getByLabelText('Notify Admin')).not.toBeChecked();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('prefills the form on Edit and saves the whole form with PATCH', async () => {
    vi.mocked(playbooksApi.updatePlaybook).mockResolvedValue({
      ...quarantine,
      name: 'Quarantine v2',
    });
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });
    const user = userEvent.setup();

    await user.click(card('Quarantine').getByRole('button', { name: 'Edit' }));

    expect(screen.getByRole('heading', { name: 'Edit playbook' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Quarantine');
    expect(screen.getByLabelText('Trigger')).toHaveValue('MALWARE_DETECTED');
    expect(screen.getByLabelText('Isolate Host')).toBeChecked();
    expect(screen.getByLabelText('Notify Admin')).toBeChecked();
    expect(screen.getByLabelText('Block IP')).not.toBeChecked();

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Quarantine v2');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Playbook "Quarantine v2" updated');
    expect(playbooksApi.updatePlaybook).toHaveBeenCalledWith('p1', {
      name: 'Quarantine v2',
      trigger: 'MALWARE_DETECTED',
      actions: ['ISOLATE_HOST', 'NOTIFY_ADMIN'],
    });
    expect(screen.getByRole('heading', { name: 'Create playbook' })).toBeInTheDocument();
  });

  it('returns to an empty create form on Cancel', async () => {
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });
    const user = userEvent.setup();
    await user.click(card('Quarantine').getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Name')).toHaveValue('Quarantine');

    await user.click(
      within(screen.getByRole('heading', { name: 'Edit playbook' }).closest('form')!).getByRole(
        'button',
        { name: 'Cancel' },
      ),
    );

    expect(screen.getByRole('heading', { name: 'Create playbook' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
    expect(screen.getByLabelText('Isolate Host')).not.toBeChecked();
  });

  it('asks for confirmation before deleting; Cancel keeps the playbook', async () => {
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });
    const user = userEvent.setup();

    await user.click(card('Quarantine').getByRole('button', { name: 'Delete' }));
    expect(card('Quarantine').getByText('Delete this playbook?')).toBeInTheDocument();
    await user.click(card('Quarantine').getByRole('button', { name: 'Cancel' }));

    expect(card('Quarantine').queryByText('Delete this playbook?')).not.toBeInTheDocument();
    expect(playbooksApi.deletePlaybook).not.toHaveBeenCalled();
  });

  it('deletes on Confirm and reloads the list', async () => {
    vi.mocked(playbooksApi.deletePlaybook).mockResolvedValue(undefined);
    vi.mocked(playbooksApi.listPlaybooks)
      .mockResolvedValueOnce([quarantine, lockdown])
      .mockResolvedValueOnce([lockdown]);
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });

    await deleteCard('Quarantine');

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Quarantine' })).not.toBeInTheDocument(),
    );
    expect(playbooksApi.deletePlaybook).toHaveBeenCalledWith('p1');
    expect(playbooksApi.listPlaybooks).toHaveBeenCalledTimes(2);
  });

  it('shows a failed delete in the card', async () => {
    vi.mocked(playbooksApi.deletePlaybook).mockRejectedValue(
      new ApiError(500, 'Internal server error'),
    );
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });

    await deleteCard('Quarantine');

    expect(await card('Quarantine').findByText('Internal server error')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Quarantine' })).toBeInTheDocument();
    expect(playbooksApi.listPlaybooks).toHaveBeenCalledTimes(1);
  });

  it('reloads the list without an error when the playbook was already deleted', async () => {
    vi.mocked(playbooksApi.deletePlaybook).mockRejectedValue(
      new ApiError(404, 'Playbook not found'),
    );
    vi.mocked(playbooksApi.listPlaybooks)
      .mockResolvedValueOnce([quarantine, lockdown])
      .mockResolvedValueOnce([lockdown]);
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });

    await deleteCard('Quarantine');

    await waitFor(() =>
      expect(screen.queryByRole('heading', { name: 'Quarantine' })).not.toBeInTheDocument(),
    );
    expect(screen.queryByText('Playbook not found')).not.toBeInTheDocument();
    expect(playbooksApi.listPlaybooks).toHaveBeenCalledTimes(2);
  });

  it('leaves edit mode when the playbook being edited is deleted', async () => {
    vi.mocked(playbooksApi.deletePlaybook).mockResolvedValue(undefined);
    vi.mocked(playbooksApi.listPlaybooks)
      .mockResolvedValueOnce([quarantine, lockdown])
      .mockResolvedValueOnce([lockdown]);
    renderApp(PLAYBOOKS_ROUTE);
    await screen.findByRole('heading', { name: 'Quarantine' });
    await userEvent.setup().click(card('Quarantine').getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('heading', { name: 'Edit playbook' })).toBeInTheDocument();

    await deleteCard('Quarantine');

    expect(await screen.findByRole('heading', { name: 'Create playbook' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });
});
