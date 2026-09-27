import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as authApi from '@/features/auth/auth.api';
import { LOGIN_ROUTE } from '@/features/auth/auth.constants';
import { PLAYBOOKS_ROUTE } from '@/features/playbooks/playbooks.constants';
import { ApiError } from '@/shared/api/api-error';
import { renderApp } from '@/app/app.test-utils';

vi.mock('../../features/auth/auth.api');

const alice = { id: '1', email: 'alice@example.com' };
const credentials = { email: 'alice@example.com', password: 'correct-horse' };
const notLoggedIn = new ApiError(401, 'Missing or invalid token');

async function logIn() {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Email'), credentials.email);
  await user.type(screen.getByLabelText('Password'), credentials.password);
  await user.click(screen.getByRole('button', { name: 'Log in' }));
}

describe('GuestRoute', () => {
  it('shows a loading state until the session check has finished', () => {
    vi.mocked(authApi.me).mockReturnValue(new Promise(() => {}));

    renderApp(LOGIN_ROUTE);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('redirects a logged-in user from /login to the home route', async () => {
    vi.mocked(authApi.me).mockResolvedValue(alice);

    renderApp(LOGIN_ROUTE);

    expect(await screen.findByRole('heading', { name: 'Simulate' })).toBeInTheDocument();
  });

  it('lands on the home route after logging in from /login directly', async () => {
    vi.mocked(authApi.me).mockRejectedValue(notLoggedIn);
    vi.mocked(authApi.login).mockResolvedValue(alice);
    renderApp(LOGIN_ROUTE);

    await logIn();

    expect(await screen.findByRole('heading', { name: 'Simulate' })).toBeInTheDocument();
  });

  it('returns to the page a visitor asked for after logging in', async () => {
    vi.mocked(authApi.me).mockRejectedValue(notLoggedIn);
    vi.mocked(authApi.login).mockResolvedValue(alice);
    renderApp(PLAYBOOKS_ROUTE);
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();

    await logIn();

    expect(await screen.findByRole('heading', { name: 'Playbooks' })).toBeInTheDocument();
  });

  it('ignores a full URL in the redirect state', async () => {
    vi.mocked(authApi.me).mockResolvedValue(alice);

    renderApp({ pathname: LOGIN_ROUTE, state: { from: 'https://evil.example/phish' } });

    expect(await screen.findByRole('heading', { name: 'Simulate' })).toBeInTheDocument();
  });
});
