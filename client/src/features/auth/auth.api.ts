import type { Credentials } from '@shared/types/auth';
import type { PublicUser } from '@shared/types/user';
import { request } from '@/shared/api/http';
import { AUTH_ENDPOINTS } from './auth.constants';

export function register(credentials: Credentials): Promise<PublicUser> {
  return request<PublicUser>(AUTH_ENDPOINTS.register, { method: 'POST', body: credentials });
}

/** Logs in; the server sets the auth cookie and returns the user. */
export function login(credentials: Credentials): Promise<PublicUser> {
  return request<PublicUser>(AUTH_ENDPOINTS.login, { method: 'POST', body: credentials });
}

export function logout(): Promise<void> {
  return request<void>(AUTH_ENDPOINTS.logout, { method: 'POST' });
}

/** The current user; rejects with a 401 ApiError when there is no valid session. */
export function me(): Promise<PublicUser> {
  return request<PublicUser>(AUTH_ENDPOINTS.me);
}
