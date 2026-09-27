export type HttpMethod = 'GET' | 'POST' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  /** Serialized as JSON. */
  body?: unknown;
}

/** Called whenever any request is answered with 401. */
export type UnauthorizedHandler = () => void;
