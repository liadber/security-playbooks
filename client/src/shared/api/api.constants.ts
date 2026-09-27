/** Prefix the dev server proxies to the API; see vite.config.ts. */
export const API_BASE_PATH = '/api';
export const JSON_CONTENT_TYPE = 'application/json';

export const HttpStatus = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
} as const;

/** The number useApiData gives its first load; each reload() counts one up. */
export const FIRST_ATTEMPT = 0;
/** The "nothing has settled yet" marker: below FIRST_ATTEMPT, so the hook starts out loading. */
export const NOT_SETTLED = -1;
