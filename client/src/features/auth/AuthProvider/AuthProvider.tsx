import type { PublicUser } from '@shared/types/user';
import { useEffect, useMemo, type ReactNode } from 'react';
import { AuthContext } from '@/features/auth/AuthContext';
import * as authApi from '@/features/auth/auth.api';
import type { AuthContextValue } from '@/features/auth/auth.types';
import { setUnauthorizedHandler } from '@/shared/api/unauthorized';
import { useApiData } from '@/shared/api/useApiData';

/**
 * Holds the current user. On mount it asks the server who is logged in, so a page reload
 * keeps the session; isLoading stays true until that answer arrives. Any 401 from the API,
 * for example after the token expires, ends the session on the client too.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // The error is intentionally unused: a failed me() means "not logged in", which is
  // exactly what user === null already says.
  const { data: user, isLoading, setData: setUser } = useApiData<PublicUser>(authApi.me);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, [setUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      async login(credentials) {
        setUser(await authApi.login(credentials));
      },
      async register(credentials) {
        await authApi.register(credentials);
        setUser(await authApi.login(credentials));
      },
      async logout() {
        try {
          await authApi.logout();
        } finally {
          // Even if the server call fails (for example an already expired session), the
          // client side of the session ends.
          setUser(null);
        }
      },
    }),
    [user, isLoading, setUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
