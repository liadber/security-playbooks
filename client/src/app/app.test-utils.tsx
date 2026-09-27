import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AppRoutes } from './AppRoutes';

/** A starting location for renderApp: a path, or a path with navigation state. */
type InitialEntry = string | { pathname: string; state?: unknown };

/** Renders the real routes at a location with an in-memory history. */
export function renderApp(entry: InitialEntry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>,
  );
}
