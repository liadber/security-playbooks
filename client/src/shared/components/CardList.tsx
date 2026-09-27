import type { ReactNode } from 'react';
import styles from './CardList.module.css';

type CardListProps = {
  /** The list items (li elements), each usually holding a Card. */
  children: ReactNode;
};

/** An unstyled list with the spacing between cards. */
export function CardList({ children }: CardListProps) {
  return <ul className={styles.list}>{children}</ul>;
}
