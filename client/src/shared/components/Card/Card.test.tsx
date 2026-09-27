import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders its content as an article', () => {
    render(<Card>Hello</Card>);

    expect(screen.getByRole('article')).toHaveTextContent('Hello');
  });

  it('marks a highlighted card with a different class', () => {
    const { rerender } = render(<Card>Item</Card>);
    const plain = screen.getByRole('article').className;

    rerender(<Card highlighted>Item</Card>);

    expect(screen.getByRole('article').className).not.toBe(plain);
  });
});
