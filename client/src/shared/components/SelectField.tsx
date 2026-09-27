import type { SelectHTMLAttributes } from 'react';
import type { ChoiceOption } from './components.types';
import { ErrorMessage } from './ErrorMessage';
import styles from './SelectField.module.css';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: ChoiceOption[];
  /** Text of the disabled first option shown until a choice is made. */
  placeholder?: string;
  /** Shown under the select. */
  error?: string;
};

export function SelectField({
  label,
  name,
  options,
  placeholder = 'Choose…',
  error,
  id = name,
  defaultValue = '',
  ...rest
}: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {/* React applies a select's defaultValue on mount only, and the reset that follows a
          form action runs before a changed default reaches the options; keying the element
          on the default remounts it, so a kept value is shown after a failed submit. */}
      <select
        {...rest}
        key={String(defaultValue)}
        id={id}
        name={name}
        defaultValue={defaultValue}
        className={error ? `${styles.select} ${styles.invalid}` : styles.select}
      >
        {/* An empty, disabled first option keeps `required` meaningful: nothing is chosen by default. */}
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}
