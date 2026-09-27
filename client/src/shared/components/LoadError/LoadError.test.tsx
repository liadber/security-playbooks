import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LoadError } from './LoadError';

describe('LoadError', () => {
  it('shows the title, the message and a Retry button that calls onRetry', async () => {
    const onRetry = vi.fn();
    render(<LoadError title="Playbooks" message="Internal server error" onRetry={onRetry} />);

    expect(screen.getByRole('heading', { name: 'Playbooks' })).toBeInTheDocument();
    expect(screen.getByText('Internal server error')).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
