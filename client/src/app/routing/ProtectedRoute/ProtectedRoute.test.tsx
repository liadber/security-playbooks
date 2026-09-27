import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as authApi from '@/features/auth/auth.api';
import { PLAYBOOKS_ROUTE } from '@/features/playbooks/playbooks.constants';
import { ApiError } from '@/shared/api/api-error';
import { renderApp } from '@/app/app.test-utils';

vi.mock('@/features/auth/auth.api');

const alice = { id: '1', email: 'alice@example.com' };

describe('ProtectedRoute', () => {
  it('shows a loading state until the session check has finished', () => {
    vi.mocked(authApi.me).mockReturnValue(new Promise(() => {}));

    renderApp(PLAYBOOKS_ROUTE);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Log in' })).not.toBeInTheDocument();
  });

  it('redirects to /login when nobody is logged in', async () => {
    vi.mocked(authApi.me).mockRejectedValue(new ApiError(401, 'Missing or invalid token'));

    renderApp(PLAYBOOKS_ROUTE);

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('renders the page for a logged-in user', async () => {
    vi.mocked(authApi.me).mockResolvedValue(alice);

    renderApp(PLAYBOOKS_ROUTE);

    expect(await screen.findByRole('heading', { name: 'Playbooks' })).toBeInTheDocument();
  });
});
