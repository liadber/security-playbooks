import { BrowserRouter } from 'react-router';
import { AppRoutes } from './app/AppRoutes';
import { AuthProvider } from './features/auth/AuthProvider';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
