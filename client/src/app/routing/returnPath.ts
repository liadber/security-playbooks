import { HOME_ROUTE } from '@/app/app.constants';
import { IN_APP_PATH_PATTERN } from './routing.constants';
import type { RedirectState } from './routing.types';

/**
 * Where to send a user after login: the page they asked for, if it is an in-app path,
 * otherwise the home route. Anything else (for example a full URL) is ignored so the
 * login page cannot be used as an open redirect.
 */
export function returnPathFrom(state: unknown): string {
  const from = (state as RedirectState | null)?.from;
  return typeof from === 'string' && IN_APP_PATH_PATTERN.test(from) ? from : HOME_ROUTE;
}
