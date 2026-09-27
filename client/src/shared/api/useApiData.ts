import { useCallback, useEffect, useState } from 'react';
import { FIRST_ATTEMPT, NOT_SETTLED } from './api.constants';
import type { UseApiDataResult } from './api.types';

/**
 * Loads data once on mount and again on each reload(). `load` must be a stable reference
 * (a module-level function or a useCallback result): it is an effect dependency, so a new
 * function on every render would load on every render. A response that arrives after
 * unmount, or after a newer reload() has started, is ignored.
 */
export function useApiData<T>(load: () => Promise<T>): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  // Each load is numbered; the hook is loading while the latest number has not settled.
  const [attempt, setAttempt] = useState(FIRST_ATTEMPT);
  const [settledAttempt, setSettledAttempt] = useState(NOT_SETTLED);

  useEffect(() => {
    let stale = false;

    load()
      .then((result) => {
        if (stale) return;
        setData(result);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (stale) return;
        setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (!stale) setSettledAttempt(attempt);
      });

    return () => {
      stale = true;
    };
  }, [load, attempt]);

  const reload = useCallback(() => setAttempt((current) => current + 1), []);

  return { data, error, isLoading: settledAttempt < attempt, reload, setData };
}
