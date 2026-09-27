import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from '@/app/AppLayout';
import { NotFoundPage } from '@/app/NotFoundPage';
import { HOME_ROUTE, NOT_FOUND_ROUTE, ROOT_ROUTE } from '@/app/app.constants';
import { GuestRoute } from '@/app/routing/GuestRoute';
import { ProtectedRoute } from '@/app/routing/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { LOGIN_ROUTE } from '@/features/auth/auth.constants';
import { PlaybooksPage } from '@/features/playbooks/PlaybooksPage';
import { PLAYBOOKS_ROUTE } from '@/features/playbooks/playbooks.constants';
import { SimulatePage } from '@/features/simulation/SimulatePage';
import { SIMULATE_ROUTE } from '@/features/simulation/simulation.constants';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path={LOGIN_ROUTE} element={<LoginPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path={PLAYBOOKS_ROUTE} element={<PlaybooksPage />} />
          <Route path={SIMULATE_ROUTE} element={<SimulatePage />} />
        </Route>
      </Route>
      <Route path={ROOT_ROUTE} element={<Navigate to={HOME_ROUTE} replace />} />
      <Route path={NOT_FOUND_ROUTE} element={<NotFoundPage />} />
    </Routes>
  );
}
