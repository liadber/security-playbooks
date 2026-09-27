import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/shared/api/api-error';
import { GENERIC_ERROR_MESSAGE } from './forms.constants';
import type { FormSubmit } from './forms.types';
import { useFormAction } from './useFormAction';

type TestFormProps = {
  submit: FormSubmit;
  keepValues?: string[];
};

function TestForm({ submit, keepValues }: TestFormProps) {
  const { state, formAction, isPending } = useFormAction(submit, { keepValues });

  return (
    <form action={formAction}>
      {state.error && <p>{state.error}</p>}
      <label>
        Email
        <input name="email" defaultValue={state.values.email} />
      </label>
      {state.fields?.email && <p>{state.fields.email}</p>}
      <label>
        Password
        <input name="password" type="password" defaultValue={state.values.password} />
      </label>
      <button type="submit" disabled={isPending}>
        Send
      </button>
    </form>
  );
}

async function fillAndSend() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email'), 'alice@example.com');
  await user.type(screen.getByLabelText('Password'), 'correct-horse');
  await user.click(screen.getByRole('button', { name: 'Send' }));
}

describe('useFormAction', () => {
  it('passes the form data to submit and reports no error on success', async () => {
    const submit = vi.fn<FormSubmit>().mockResolvedValue(undefined);
    render(<TestForm submit={submit} />);

    await fillAndSend();

    expect(submit).toHaveBeenCalledOnce();
    expect(submit.mock.calls[0][0].get('email')).toBe('alice@example.com');
    expect(screen.queryByText(GENERIC_ERROR_MESSAGE)).not.toBeInTheDocument();
  });

  it('exposes the server field errors', async () => {
    const submit = vi
      .fn<FormSubmit>()
      .mockRejectedValue(
        new ApiError(400, 'Validation failed', { email: 'Must be a valid email address' }),
      );
    render(<TestForm submit={submit} />);

    await fillAndSend();

    expect(await screen.findByText('Must be a valid email address')).toBeInTheDocument();
    expect(screen.queryByText('Validation failed')).not.toBeInTheDocument();
  });

  it('exposes a general error for an ApiError without field errors', async () => {
    const submit = vi.fn<FormSubmit>().mockRejectedValue(new ApiError(401, 'Invalid credentials'));
    render(<TestForm submit={submit} />);

    await fillAndSend();

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('shows the generic message for a failure that is not an ApiError', async () => {
    const submit = vi.fn<FormSubmit>().mockRejectedValue(new TypeError('Failed to fetch'));
    render(<TestForm submit={submit} />);

    await fillAndSend();

    expect(await screen.findByText(GENERIC_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText('Failed to fetch')).not.toBeInTheDocument();
  });

  it('keeps the requested values after a failed submit, but never a password', async () => {
    const submit = vi.fn<FormSubmit>().mockRejectedValue(new ApiError(401, 'Invalid credentials'));
    render(<TestForm submit={submit} keepValues={['email', 'password']} />);

    await fillAndSend();

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('alice@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('disables the submit button while the submission is pending', async () => {
    const submit = vi.fn<FormSubmit>().mockReturnValue(new Promise(() => {}));
    render(<TestForm submit={submit} />);

    await fillAndSend();

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
});
