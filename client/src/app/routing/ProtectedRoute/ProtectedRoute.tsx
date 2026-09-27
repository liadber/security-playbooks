import { Navigate, Outlet, useLocation } from 'react-router';
import type { RedirectState } from '@/app/routing/routing.types';
import { LOGIN_ROUTE } from '@/features/auth/auth.constants';
import { useAuth } from '@/features/auth/useAuth';
import { LoadingScreen } from '@/shared/components/LoadingScreen';

/**
 * Renders the nested routes for a logged-in user. A visitor is sent to /login, with the
 * page they asked for in the navigation state so they come back to it after logging in.
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Deciding before the session check has finished would bounce a logged-in user to /login.
  if (isLoading) {
    return <LoadingScreen />;
  }
  if (!user) {
    const state: RedirectState = { from: location.pathname + location.search };
    return <Navigate to={LOGIN_ROUTE} replace state={state} />;
  }
  return <Outlet />;
}
