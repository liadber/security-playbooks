import type { ReactNode } from 'react';
import styles from './PageLayout.module.css';

type PageLayoutProps = {
  title: string;
  /** Navigation links, rendered in the header. */
  nav?: ReactNode;
  /** Current-user area of the header, for example the email and a logout button. */
  user?: ReactNode;
  children: ReactNode;
};

export function PageLayout({ title, nav, user, children }: PageLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.brand}>{title}</span>
          {nav && <nav className={styles.nav}>{nav}</nav>}
          {user && <div className={styles.user}>{user}</div>}
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
