import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CheckboxGroup } from './CheckboxGroup';

const options = [
  { value: 'A', label: 'Alpha' },
  { value: 'B', label: 'Beta' },
];

describe('CheckboxGroup', () => {
  it('renders a fieldset with a legend and one labelled checkbox per option, sharing the name', () => {
    render(<CheckboxGroup legend="Letters" name="letters" options={options} />);

    expect(screen.getByRole('group', { name: 'Letters' })).toBeInTheDocument();
    for (const option of options) {
      const checkbox = screen.getByLabelText(option.label);
      expect(checkbox).toHaveAttribute('type', 'checkbox');
      expect(checkbox).toHaveAttribute('name', 'letters');
      expect(checkbox).toHaveAttribute('value', option.value);
      expect(checkbox).not.toBeChecked();
    }
  });

  it('checks the default values and lets the user toggle them', async () => {
    render(
      <CheckboxGroup legend="Letters" name="letters" options={options} defaultChecked={['B']} />,
    );
    expect(screen.getByLabelText('Beta')).toBeChecked();
    expect(screen.getByLabelText('Alpha')).not.toBeChecked();

    await userEvent.setup().click(screen.getByLabelText('Alpha'));

    expect(screen.getByLabelText('Alpha')).toBeChecked();
  });

  it('shows its error under the group', () => {
    render(
      <CheckboxGroup legend="Letters" name="letters" options={options} error="Pick at least one" />,
    );

    expect(screen.getByText('Pick at least one')).toBeInTheDocument();
  });
});
