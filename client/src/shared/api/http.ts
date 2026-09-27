import type { ErrorResponse } from '@shared/types/api';
import { ApiError } from './api-error';
import { API_BASE_PATH, HttpStatus, JSON_CONTENT_TYPE } from './api.constants';
import type { RequestOptions } from './api.types';
import { notifyUnauthorized } from './unauthorized';

/**
 * Sends a JSON request to the API and returns the parsed JSON response.
 * Resolves to undefined for 204 responses and throws an ApiError for any non-2xx status.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const response = await fetch(`${API_BASE_PATH}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': JSON_CONTENT_TYPE },
    body: body === undefined ? undefined : JSON.stringify(body),
    // The auth cookie is httpOnly and same-origin (the dev server proxies /api), so the
    // browser attaches it itself; the client never handles a token.
    credentials: 'same-origin',
  });

  if (!response.ok) {
    if (response.status === HttpStatus.UNAUTHORIZED) {
      notifyUnauthorized();
    }
    throw await toApiError(response);
  }

  if (response.status === HttpStatus.NO_CONTENT) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  let payload: Partial<ErrorResponse> = {};
  try {
    payload = (await response.json()) as ErrorResponse;
  } catch {
    // Not a JSON body (for example a proxy error page); fall back to the status text.
  }
  return new ApiError(response.status, payload.error ?? response.statusText, payload.fields);
}
