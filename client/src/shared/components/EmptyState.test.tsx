import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the message as a paragraph', () => {
    render(<EmptyState>Nothing here yet.</EmptyState>);

    const message = screen.getByText('Nothing here yet.');
    expect(message.tagName).toBe('P');
  });
});
