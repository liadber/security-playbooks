import type { ReactNode } from 'react';
import styles from './SuccessMessage.module.css';

type SuccessMessageProps = {
  children: ReactNode;
};

/** Rendered as <output>: its implicit status role lets screen readers announce it without ARIA. */
export function SuccessMessage({ children }: SuccessMessageProps) {
  return <output className={styles.message}>{children}</output>;
}
