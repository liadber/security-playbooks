import { useActionState } from 'react';
import { INITIAL_FORM_STATE, PASSWORD_FIELD_PATTERN } from './forms.constants';
import type {
  FormState,
  FormSubmit,
  UseFormActionOptions,
  UseFormActionResult,
} from './forms.types';
import { toFormErrors } from './toFormErrors';

/**
 * A form action that submits to the API. On failure the returned state carries the
 * server's general and per-field errors, plus the submitted values of the fields named
 * in keepValues so the inputs can show them again.
 */
export function useFormAction(
  submit: FormSubmit,
  options: UseFormActionOptions = {},
): UseFormActionResult {
  const { keepValues = [] } = options;

  const [state, formAction, isPending] = useActionState(
    async (_previous: FormState, formData: FormData): Promise<FormState> => {
      const values = keptValues(formData, keepValues);
      try {
        await submit(formData);
        return { values };
      } catch (err) {
        return { values, ...toFormErrors(err) };
      }
    },
    INITIAL_FORM_STATE,
  );

  return { state, formAction, isPending };
}

function keptValues(formData: FormData, names: string[]): Record<string, string> {
  return Object.fromEntries(
    names
      .filter((name) => !PASSWORD_FIELD_PATTERN.test(name))
      .map((name) => [name, String(formData.get(name) ?? '')]),
  );
}
