import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardList } from './CardList';

describe('CardList', () => {
  it('renders its items as a list', () => {
    render(
      <CardList>
        <li>First</li>
        <li>Second</li>
      </CardList>,
    );

    const items = screen.getAllByRole('listitem').map((item) => item.textContent);
    expect(items).toEqual(['First', 'Second']);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
