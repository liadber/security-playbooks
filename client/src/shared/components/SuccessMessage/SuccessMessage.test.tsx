import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SuccessMessage } from './SuccessMessage';

describe('SuccessMessage', () => {
  it('renders the message in an output element, which is announced as a status', () => {
    render(<SuccessMessage>Saved</SuccessMessage>);

    const message = screen.getByRole('status');
    expect(message.tagName).toBe('OUTPUT');
    expect(message).toHaveTextContent('Saved');
  });
});
