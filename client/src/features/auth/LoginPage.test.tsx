import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/api-error';
import * as authApi from './auth.api';
import { AuthProvider } from './AuthProvider';
import { LoginPage } from './LoginPage';

vi.mock('./auth.api');

const alice = { id: '1', email: 'alice@example.com' };
const credentials = { email: 'alice@example.com', password: 'correct-horse' };

beforeEach(() => {
  vi.mocked(authApi.me).mockRejectedValue(new ApiError(401, 'Missing or invalid token'));
});

function renderLoginPage() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );
}

async function fillAndSubmit(submitLabel: string) {
  const user = userEvent.setup();
  await user.type(await screen.findByLabelText('Email'), credentials.email);
  await user.type(screen.getByLabelText('Password'), credentials.password);
  await user.click(screen.getByRole('button', { name: submitLabel }));
}

describe('LoginPage', () => {
  it('logs in with the submitted credentials', async () => {
    vi.mocked(authApi.login).mockResolvedValue(alice);
    renderLoginPage();

    await fillAndSubmit('Log in');

    expect(authApi.login).toHaveBeenCalledWith(credentials);
  });

  it('shows server field errors next to the fields and keeps the email', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(400, 'Validation failed', { email: 'Must be a valid email address' }),
    );
    renderLoginPage();

    await fillAndSubmit('Log in');

    expect(await screen.findByText('Must be a valid email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue(credentials.email);
  });

  it('shows a general error when the credentials are wrong and stays on the form', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    renderLoginPage();

    await fillAndSubmit('Log in');

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('switches to registration and registers', async () => {
    vi.mocked(authApi.register).mockResolvedValue(alice);
    vi.mocked(authApi.login).mockResolvedValue(alice);
    renderLoginPage();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Create one' }));
    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    await fillAndSubmit('Create account');

    expect(authApi.register).toHaveBeenCalledWith(credentials);
    expect(authApi.login).toHaveBeenCalledWith(credentials);
  });
});
