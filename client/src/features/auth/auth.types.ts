import type { Credentials } from '@shared/types/auth';
import type { PublicUser } from '@shared/types/user';
import type { AUTH_MODE } from './auth.constants';

export interface AuthContextValue {
  /** The logged-in user, or null when logged out. */
  user: PublicUser | null;
  /** True until the initial session check has finished. */
  isLoading: boolean;
  login(credentials: Credentials): Promise<void>;
  /** Creates the account and logs in with it. */
  register(credentials: Credentials): Promise<void>;
  logout(): Promise<void>;
}

export type AuthMode = (typeof AUTH_MODE)[keyof typeof AUTH_MODE];
