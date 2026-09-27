import type { UnauthorizedHandler } from './api.types';

let handler: UnauthorizedHandler | null = null;

/**
 * Registers what happens when any request gets a 401, for example clearing the session
 * after the token expires. Pass null to unregister. Kept here so the API layer can report
 * it without knowing about auth state.
 */
export function setUnauthorizedHandler(next: UnauthorizedHandler | null): void {
  handler = next;
}

export function notifyUnauthorized(): void {
  handler?.();
}
