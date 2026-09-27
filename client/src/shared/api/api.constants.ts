/** Prefix the dev server proxies to the API; see vite.config.ts. */
export const API_BASE_PATH = '/api';
export const JSON_CONTENT_TYPE = 'application/json';

export const HttpStatus = {
  NO_CONTENT: 204,
  UNAUTHORIZED: 401,
} as const;
