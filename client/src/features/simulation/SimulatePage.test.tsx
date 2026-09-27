import type { PlaybookOptions } from '@shared/types/playbook';
import type { SimulationResult } from '@shared/types/simulation';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '@/app/app.test-utils';
import * as authApi from '@/features/auth/auth.api';
import { ApiError } from '@/shared/api/api-error';
import * as optionsApi from '@/shared/options/options.api';
import * as simulationApi from './simulation.api';
import { SIMULATE_ROUTE } from './simulation.constants';

vi.mock('@/features/auth/auth.api');
vi.mock('@/shared/options/options.api');
vi.mock('./simulation.api');

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

const malwareMatches: SimulationResult = {
  trigger: 'MALWARE_DETECTED',
  matches: [
    { id: 'p1', name: 'Alpha response', actions: ['ISOLATE_HOST', 'BLOCK_IP'] },
    { id: 'p2', name: 'beta response', actions: ['NOTIFY_ADMIN'] },
  ],
};

const hint = 'Choose a trigger to see which playbooks would run.';

beforeEach(() => {
  vi.mocked(authApi.me).mockResolvedValue(alice);
  vi.mocked(optionsApi.getPlaybookOptions).mockResolvedValue(options);
});

async function simulate(triggerLabel: string) {
  const user = userEvent.setup();
  await user.selectOptions(await screen.findByLabelText('Trigger'), triggerLabel);
  await user.click(screen.getByRole('button', { name: 'Simulate' }));
}

describe('SimulatePage', () => {
  it('shows the title and a hint before the first simulation', async () => {
    renderApp(SIMULATE_ROUTE);

    expect(await screen.findByLabelText('Trigger')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Matching playbooks' })).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('shows the matches with their labels under a title naming the trigger', async () => {
    vi.mocked(simulationApi.simulateTrigger).mockResolvedValue(malwareMatches);
    renderApp(SIMULATE_ROUTE);

    await simulate('Malware Detected');

    expect(
      await screen.findByRole('heading', { name: 'Matching playbooks for Malware Detected' }),
    ).toBeInTheDocument();
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(['Alpha response', 'beta response']);
    expect(screen.getByText('Actions: Isolate Host → Block IP')).toBeInTheDocument();
    expect(simulationApi.simulateTrigger).toHaveBeenCalledWith('MALWARE_DETECTED');
    expect(screen.getByLabelText('Trigger')).toHaveValue('MALWARE_DETECTED');
    expect(screen.queryByText(hint)).not.toBeInTheDocument();
  });

  it('shows only a message when no playbook would run', async () => {
    vi.mocked(simulationApi.simulateTrigger).mockResolvedValue({
      trigger: 'LOGIN_ATTEMPT',
      matches: [],
    });
    renderApp(SIMULATE_ROUTE);

    await simulate('Login Attempt');

    expect(await screen.findByText('No playbook runs for this trigger yet.')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Matching playbooks for Login Attempt' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('shows a server error', async () => {
    vi.mocked(simulationApi.simulateTrigger).mockRejectedValue(
      new ApiError(500, 'Internal server error'),
    );
    renderApp(SIMULATE_ROUTE);

    await simulate('Login Attempt');

    expect(await screen.findByText('Internal server error')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Matching playbooks' })).toBeInTheDocument();
  });

  it('clears the previous result when a later simulation fails', async () => {
    vi.mocked(simulationApi.simulateTrigger)
      .mockResolvedValueOnce(malwareMatches)
      .mockRejectedValueOnce(new ApiError(500, 'Internal server error'));
    renderApp(SIMULATE_ROUTE);
    await simulate('Malware Detected');
    expect(await screen.findByRole('heading', { name: 'Alpha response' })).toBeInTheDocument();

    await simulate('Login Attempt');

    expect(await screen.findByText('Internal server error')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Alpha response' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Matching playbooks' })).toBeInTheDocument();
    expect(screen.getByText(hint)).toBeInTheDocument();
  });

  it('shows a retry button when the options cannot be loaded', async () => {
    vi.mocked(optionsApi.getPlaybookOptions)
      .mockRejectedValueOnce(new ApiError(500, 'Internal server error'))
      .mockResolvedValueOnce(options);
    renderApp(SIMULATE_ROUTE);
    expect(await screen.findByText('Internal server error')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByLabelText('Trigger')).toBeInTheDocument();
  });
});
