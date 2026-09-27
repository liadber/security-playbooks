import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidebarLayout } from './SidebarLayout';

describe('SidebarLayout', () => {
  it('puts the sidebar content in an aside', () => {
    render(
      <SidebarLayout>
        <SidebarLayout.Sidebar>
          <button type="button">Sidebar action</button>
        </SidebarLayout.Sidebar>
        <SidebarLayout.Main title="Items">Nothing here</SidebarLayout.Main>
      </SidebarLayout>,
    );

    const sidebar = screen.getByRole('complementary');
    expect(within(sidebar).getByRole('button', { name: 'Sidebar action' })).toBeInTheDocument();
  });

  it('shows the main title as a heading with the content under it', () => {
    render(
      <SidebarLayout>
        <SidebarLayout.Main title="Items">
          <p>First item</p>
        </SidebarLayout.Main>
        <SidebarLayout.Sidebar>Aside</SidebarLayout.Sidebar>
      </SidebarLayout>,
    );

    const heading = screen.getByRole('heading', { name: 'Items' });
    const main = heading.closest('section')!;
    expect(within(main).getByText('First item')).toBeInTheDocument();
    expect(screen.getByRole('complementary')).toHaveTextContent('Aside');
  });
});
