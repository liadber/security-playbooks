import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '@/features/auth/auth.api';
import { SIMULATE_ROUTE } from '@/features/simulation/simulation.constants';
import { renderApp } from './app.test-utils';

vi.mock('../features/auth/auth.api');

const alice = { id: '1', email: 'alice@example.com' };

beforeEach(() => {
  vi.mocked(authApi.me).mockResolvedValue(alice);
});

describe('AppLayout', () => {
  it('shows the logged-in email', async () => {
    renderApp(SIMULATE_ROUTE);

    expect(await screen.findByText(alice.email)).toBeInTheDocument();
  });

  it('navigates between Playbooks and Simulate', async () => {
    renderApp(SIMULATE_ROUTE);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('link', { name: 'Playbooks' }));
    expect(screen.getByRole('heading', { name: 'Playbooks' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Simulate' }));
    expect(screen.getByRole('heading', { name: 'Simulate' })).toBeInTheDocument();
  });

  it('returns to /login after logging out', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined);
    renderApp(SIMULATE_ROUTE);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Log out' }));

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(authApi.logout).toHaveBeenCalledOnce();
  });
});
