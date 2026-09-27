import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SelectField } from './SelectField';

const options = [
  { value: 'A', label: 'Alpha' },
  { value: 'B', label: 'Beta' },
];

describe('SelectField', () => {
  it('renders a labelled select with the options and a disabled placeholder first', () => {
    render(<SelectField label="Letter" name="letter" options={options} />);

    const select = screen.getByLabelText('Letter');
    expect(select).toHaveAttribute('name', 'letter');
    expect(screen.getByRole('option', { name: 'Choose…' })).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveValue('A');
    expect(screen.getByRole('option', { name: 'Beta' })).toHaveValue('B');
    expect(select).toHaveValue('');
  });

  it('starts on the default value and lets the user choose another', async () => {
    render(<SelectField label="Letter" name="letter" options={options} defaultValue="B" />);
    const select = screen.getByLabelText('Letter');
    expect(select).toHaveValue('B');

    await userEvent.setup().selectOptions(select, 'A');

    expect(select).toHaveValue('A');
  });

  it('shows its error under the select', () => {
    render(<SelectField label="Letter" name="letter" options={options} error="Pick one" />);

    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });
});
