import type { ReactNode } from 'react';
import styles from './SidebarLayout.module.css';

type SidebarLayoutProps = {
  children: ReactNode;
};

type SidebarProps = {
  children: ReactNode;
};

type MainProps = {
  /** Shown as a heading that stays fixed above the scrolling content. */
  title: string;
  children: ReactNode;
};

/**
 * A page body with a fixed-width sidebar beside a main area, the React counterpart of
 * multi-slot content projection: the page puts any content into SidebarLayout.Sidebar and
 * SidebarLayout.Main, and CSS order places each part, so the JSX order does not matter. The
 * layout takes the height its page leaves it, and only the parts marked below scroll.
 */
export function SidebarLayout({ children }: SidebarLayoutProps) {
  return <div className={styles.layout}>{children}</div>;
}

/** The narrow column; it scrolls on its own when it is taller than the screen. */
function Sidebar({ children }: SidebarProps) {
  return <aside className={styles.sidebar}>{children}</aside>;
}

/** The wide column: the title stays at the top while the content under it scrolls. */
function Main({ title, children }: MainProps) {
  return (
    <section className={styles.main}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.content}>{children}</div>
    </section>
  );
}

SidebarLayout.Sidebar = Sidebar;
SidebarLayout.Main = Main;
