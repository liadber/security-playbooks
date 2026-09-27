import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders a labelled input without an error', () => {
    render(<FormField label="Email" name="email" type="email" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('name', 'email');
    expect(screen.queryByText('Must be a valid email address')).not.toBeInTheDocument();
  });

  it('shows its error under the input', () => {
    render(<FormField label="Email" name="email" error="Must be a valid email address" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByText('Must be a valid email address')).toBeInTheDocument();
  });
});
