import type { Credentials } from '@shared/types/auth';
import { AUTH_FIELDS } from './auth.constants';

export function readCredentials(formData: FormData): Credentials {
  return {
    email: String(formData.get(AUTH_FIELDS.email) ?? ''),
    password: String(formData.get(AUTH_FIELDS.password) ?? ''),
  };
}
