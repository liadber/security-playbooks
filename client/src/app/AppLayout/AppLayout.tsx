import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '@/features/auth/useAuth';
import { PLAYBOOKS_ROUTE } from '@/features/playbooks/playbooks.constants';
import { SIMULATE_ROUTE } from '@/features/simulation/simulation.constants';
import { Button } from '@/shared/components/Button';
import { PageLayout } from '@/shared/components/PageLayout';
import { APP_NAME } from '@/shared/constants/app.constants';
import styles from './AppLayout.module.css';

/** The header and navigation around every logged-in page. */
export function AppLayout() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <PageLayout
      title={APP_NAME}
      nav={
        <>
          <NavLink to={PLAYBOOKS_ROUTE} className={navLinkClass}>
            Playbooks
          </NavLink>
          <NavLink to={SIMULATE_ROUTE} className={navLinkClass}>
            Simulate
          </NavLink>
        </>
      }
      user={
        <>
          <span>{user?.email}</span>
          <Button variant="secondary" pending={isLoggingOut} onClick={handleLogout}>
            Log out
          </Button>
        </>
      }
    >
      <Outlet />
    </PageLayout>
  );
}
