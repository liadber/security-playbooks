import type { ChoiceOption } from './components.types';
import styles from './CheckboxGroup.module.css';
import { ErrorMessage } from './ErrorMessage';

type CheckboxGroupProps = {
  legend: string;
  /** Shared by every checkbox, so the form data carries one entry per checked option. */
  name: string;
  options: ChoiceOption[];
  /** Values checked on first render. */
  defaultChecked?: string[];
  /** Shown under the group. */
  error?: string;
};

export function CheckboxGroup({
  legend,
  name,
  options,
  defaultChecked = [],
  error,
}: CheckboxGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <div key={option.value} className={styles.option}>
            <input
              type="checkbox"
              id={id}
              name={name}
              value={option.value}
              defaultChecked={defaultChecked.includes(option.value)}
              className={styles.checkbox}
            />
            <label htmlFor={id}>{option.label}</label>
          </div>
        );
      })}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </fieldset>
  );
}
