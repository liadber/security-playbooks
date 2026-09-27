import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/useAuth';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { returnPathFrom } from './returnPath';

/**
 * Renders the nested routes for a visitor. A logged-in user is sent to the page they
 * asked for before logging in, or to the home route.
 */
export function GuestRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }
  if (user) {
    return <Navigate to={returnPathFrom(location.state)} replace />;
  }
  return <Outlet />;
}
