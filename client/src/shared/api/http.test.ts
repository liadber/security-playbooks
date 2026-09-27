import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api-error';
import { request } from './http';
import { setUnauthorizedHandler } from './unauthorized';

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Resolves to the rejection reason, so tests can inspect the thrown ApiError. */
const rejectionOf = (promise: Promise<unknown>): Promise<ApiError> =>
  promise.then(
    () => Promise.reject(new Error('expected the request to fail')),
    (error: unknown) => error as ApiError,
  );

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe('request', () => {
  it('sends JSON to the API base path with same-origin credentials', async () => {
    const fetchMock = mockFetch(jsonResponse(200, {}));

    await request('/auth/login', { method: 'POST', body: { email: 'alice@example.com' } });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com' }),
      }),
    );
  });

  it('defaults to GET without a body', async () => {
    const fetchMock = mockFetch(jsonResponse(200, {}));

    await request('/auth/me');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({ method: 'GET', body: undefined, headers: undefined }),
    );
  });

  it('parses the JSON response', async () => {
    mockFetch(jsonResponse(200, { id: '1', email: 'alice@example.com' }));

    await expect(request('/auth/me')).resolves.toEqual({ id: '1', email: 'alice@example.com' });
  });

  it('resolves to undefined for a 204 response', async () => {
    mockFetch(new Response(null, { status: 204 }));

    await expect(request('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('throws an ApiError with the status and the server message', async () => {
    mockFetch(jsonResponse(409, { error: 'Email is already registered' }));

    const error = await rejectionOf(request('/auth/register', { method: 'POST', body: {} }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 409, message: 'Email is already registered' });
    expect(error.fields).toBeUndefined();
  });

  it('includes the field errors of a validation failure', async () => {
    mockFetch(
      jsonResponse(400, {
        error: 'Validation failed',
        fields: { email: 'Must be a valid email address' },
      }),
    );

    const error = await rejectionOf(request('/auth/register', { method: 'POST', body: {} }));

    expect(error).toMatchObject({
      status: 400,
      fields: { email: 'Must be a valid email address' },
    });
  });

  it('falls back to the status text when the error body is not JSON', async () => {
    mockFetch(new Response('<html>', { status: 502, statusText: 'Bad Gateway' }));

    const error = await rejectionOf(request('/auth/me'));

    expect(error).toMatchObject({ status: 502, message: 'Bad Gateway' });
  });

  it('notifies the unauthorized handler on a 401 and still throws', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    mockFetch(jsonResponse(401, { error: 'Missing or invalid token' }));

    const error = await rejectionOf(request('/auth/me'));

    expect(onUnauthorized).toHaveBeenCalledOnce();
    expect(error).toMatchObject({ status: 401, message: 'Missing or invalid token' });
  });

  it('does not notify the unauthorized handler for other failures', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    mockFetch(jsonResponse(409, { error: 'Email is already registered' }));

    await rejectionOf(request('/auth/register', { method: 'POST', body: {} }));

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
