import type { ReactNode } from 'react';
import styles from './ErrorMessage.module.css';

type ErrorMessageProps = {
  children: ReactNode;
};

export function ErrorMessage({ children }: ErrorMessageProps) {
  return <p className={styles.error}>{children}</p>;
}
