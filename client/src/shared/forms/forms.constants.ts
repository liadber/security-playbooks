import type { FormState } from './forms.types';

export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const INITIAL_FORM_STATE: FormState = { values: {} };

/** Fields matching this are never kept between submits, whatever the form asks for. */
export const PASSWORD_FIELD_PATTERN = /password/i;
