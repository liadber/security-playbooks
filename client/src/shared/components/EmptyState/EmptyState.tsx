import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  children: ReactNode;
};

/** A muted message where a list would be: nothing yet, no match, or a hint on what to do. */
export function EmptyState({ children }: EmptyStateProps) {
  return <p className={styles.message}>{children}</p>;
}
