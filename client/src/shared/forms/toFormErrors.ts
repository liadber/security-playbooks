import { ApiError } from '@/shared/api/api-error';
import { GENERIC_ERROR_MESSAGE } from './forms.constants';
import type { FormState } from './forms.types';

/** Field errors go next to their fields; anything else becomes the general message. */
export function toFormErrors(err: unknown): Pick<FormState, 'error' | 'fields'> {
  if (err instanceof ApiError) {
    return err.fields ? { fields: err.fields } : { error: err.message };
  }
  return { error: GENERIC_ERROR_MESSAGE };
}
