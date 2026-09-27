import type { Dispatch, SetStateAction } from 'react';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  /** Serialized as JSON. */
  body?: unknown;
}

/** Called whenever any request is answered with 401. */
export type UnauthorizedHandler = () => void;

export interface UseApiDataResult<T> {
  /** The last loaded value, or what setData was given; null until a load succeeds. */
  data: T | null;
  /** Why the latest failed load failed; cleared when a load succeeds, not when one starts. */
  error: Error | null;
  /** True until the current load settles. */
  isLoading: boolean;
  /** Loads again; a response still in flight from an earlier load is then ignored. */
  reload: () => void;
  /** Replaces data directly, for callers that already hold the new value. */
  setData: Dispatch<SetStateAction<T | null>>;
}
