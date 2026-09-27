import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '@/features/auth/auth.api';
import { SIMULATE_ROUTE } from '@/features/simulation/simulation.constants';
import { request } from '@/shared/api/http';
import { ROOT_ROUTE } from './app.constants';
import { renderApp } from './app.test-utils';

vi.mock('../features/auth/auth.api');

const alice = { id: '1', email: 'alice@example.com' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AppRoutes', () => {
  it('redirects / to /simulate', async () => {
    vi.mocked(authApi.me).mockResolvedValue(alice);

    renderApp(ROOT_ROUTE);

    expect(await screen.findByRole('heading', { name: 'Simulate' })).toBeInTheDocument();
  });

  it('shows a not-found page for an unknown path', async () => {
    vi.mocked(authApi.me).mockResolvedValue(alice);

    renderApp('/no-such-page');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('sends the user to /login when a request is answered with 401', async () => {
    vi.mocked(authApi.me).mockResolvedValue(alice);
    renderApp(SIMULATE_ROUTE);
    expect(await screen.findByRole('heading', { name: 'Simulate' })).toBeInTheDocument();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'Missing or invalid token' }), { status: 401 }),
        ),
    );

    await request('/playbooks').catch(() => {
      // The rejection is expected; the redirect is what matters here.
    });

    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});
