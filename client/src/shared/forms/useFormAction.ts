import { useActionState } from 'react';
import { INITIAL_FORM_STATE, PASSWORD_FIELD_PATTERN } from './forms.constants';
import type {
  FormState,
  FormSubmit,
  FormValue,
  UseFormActionOptions,
  UseFormActionResult,
} from './forms.types';
import { toFormErrors } from './toFormErrors';

/**
 * A form action that submits to the API. On failure the returned state carries the
 * server's general and per-field errors, plus the submitted values of the fields named
 * in keepValues (one value each) and keepMultiValues (every checked value) so the inputs
 * can show them again.
 */
export function useFormAction(
  submit: FormSubmit,
  options: UseFormActionOptions = {},
): UseFormActionResult {
  const { keepValues = [], keepMultiValues = [] } = options;

  const [state, formAction, isPending] = useActionState(
    async (_previous: FormState, formData: FormData): Promise<FormState> => {
      const values = keptValues(formData, keepValues, keepMultiValues);
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

function keptValues(
  formData: FormData,
  single: string[],
  multi: string[],
): Record<string, FormValue> {
  const keep = (name: string) => !PASSWORD_FIELD_PATTERN.test(name);
  return Object.fromEntries([
    ...single.filter(keep).map((name) => [name, String(formData.get(name) ?? '')]),
    ...multi.filter(keep).map((name) => [name, formData.getAll(name).map(String)]),
  ]);
}
