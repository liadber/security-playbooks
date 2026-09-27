export const LOGIN_ROUTE = '/login';

/** Matches the server's registration rule. */
export const PASSWORD_MIN_LENGTH = 8;

export const AUTH_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  logout: '/auth/logout',
  me: '/auth/me',
} as const;

export const AUTH_MODE = {
  LOGIN: 'login',
  REGISTER: 'register',
} as const;

/** Form field names; they double as the keys of the server's field errors. */
export const AUTH_FIELDS = {
  email: 'email',
  password: 'password',
} as const;
