import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '@/features/auth/auth.api';
import { useAuth } from '@/features/auth/useAuth';
import { request } from '@/shared/api/http';
import { AuthProvider } from './AuthProvider';

vi.mock('@/features/auth/auth.api');

const alice = { id: '1', email: 'alice@example.com' };

function SessionProbe() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p>checking</p>;
  return <p>{user ? user.email : 'logged out'}</p>;
}

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      type="button"
      onClick={() => {
        logout().catch(() => {
          // A failed logout request is part of what these tests exercise.
        });
      }}
    >
      Log out
    </button>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <SessionProbe />
      <LogoutButton />
    </AuthProvider>,
  );
}

beforeEach(() => {
  vi.mocked(authApi.me).mockResolvedValue(alice);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AuthProvider', () => {
  it('restores the session from the server on start', async () => {
    renderProbe();

    expect(screen.getByText('checking')).toBeInTheDocument();
    expect(await screen.findByText(alice.email)).toBeInTheDocument();
  });

  it('logs the user out when any request is answered with 401', async () => {
    renderProbe();
    expect(await screen.findByText(alice.email)).toBeInTheDocument();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: 'Missing or invalid token' }), { status: 401 }),
        ),
    );

    await request('/playbooks').catch(() => {
      // The rejection is expected; the session change is what matters here.
    });

    expect(await screen.findByText('logged out')).toBeInTheDocument();
  });

  it('ends the session locally even when the logout request fails', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('network down'));
    renderProbe();
    expect(await screen.findByText(alice.email)).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByText('logged out')).toBeInTheDocument();
    expect(authApi.logout).toHaveBeenCalledOnce();
  });
});
