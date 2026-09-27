import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useApiData } from './useApiData';

/** A promise that the test settles by hand. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('useApiData', () => {
  it('loads on mount', async () => {
    const load = vi.fn().mockResolvedValue('first');

    const { result } = renderHook(() => useApiData(load));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBe('first');
    expect(result.current.error).toBeNull();
    expect(load).toHaveBeenCalledOnce();
  });

  it('exposes the error of a failed load', async () => {
    const load = vi.fn().mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useApiData(load));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toEqual(new Error('boom'));
    expect(result.current.data).toBeNull();
  });

  it('loads again on reload()', async () => {
    const load = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    const { result } = renderHook(() => useApiData(load));
    await waitFor(() => expect(result.current.data).toBe('first'));

    act(() => result.current.reload());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.data).toBe('second'));
    expect(result.current.isLoading).toBe(false);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('ignores a response that arrives after a newer reload() started', async () => {
    const first = deferred<string>();
    const load = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValueOnce('second');
    const { result } = renderHook(() => useApiData(load));

    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toBe('second'));
    await act(async () => {
      first.resolve('first');
    });

    expect(result.current.data).toBe('second');
    expect(result.current.isLoading).toBe(false);
  });

  it('replaces data through setData', async () => {
    const load = vi.fn().mockResolvedValue('loaded');
    const { result } = renderHook(() => useApiData(load));
    await waitFor(() => expect(result.current.data).toBe('loaded'));

    act(() => result.current.setData('replaced'));

    expect(result.current.data).toBe('replaced');
    expect(load).toHaveBeenCalledOnce();
  });
});
