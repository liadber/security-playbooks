import type { ReactNode } from 'react';
import styles from './Card.module.css';

type CardProps = {
  /** Marks the item the user is currently working on, for example the playbook being edited. */
  highlighted?: boolean;
  children: ReactNode;
};

export function Card({ highlighted = false, children }: CardProps) {
  return (
    <article className={highlighted ? `${styles.card} ${styles.highlighted}` : styles.card}>
      {children}
    </article>
  );
}
