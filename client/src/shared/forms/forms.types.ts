/** A kept field value: one string for a single input, a list for a group of checkboxes. */
export type FormValue = string | string[];

export interface FormState {
  /** A failure that is not about one field, such as wrong credentials. */
  error?: string;
  /** Server validation messages keyed by field name. */
  fields?: Record<string, string>;
  /** Submitted values to show again after a failed submit, keyed by field name. */
  values: Record<string, FormValue>;
}

/** Sends the form data to the API; rejects (usually with an ApiError) when it fails. */
export type FormSubmit = (formData: FormData) => Promise<void>;

export interface UseFormActionOptions {
  /** Names of single-value fields whose submitted value is kept after a failed submit. Password fields never are. */
  keepValues?: string[];
  /** Names of multi-value fields (checkbox groups) whose checked values are all kept. */
  keepMultiValues?: string[];
}

export interface UseFormActionResult {
  state: FormState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}
