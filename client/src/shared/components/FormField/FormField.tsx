import type { InputHTMLAttributes } from 'react';
import { ErrorMessage } from '@/shared/components/ErrorMessage';
import styles from './FormField.module.css';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  /** Shown under the input. */
  error?: string;
};

export function FormField({ label, name, error, id = name, ...rest }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        {...rest}
        id={id}
        name={name}
        className={error ? `${styles.input} ${styles.invalid}` : styles.input}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}
