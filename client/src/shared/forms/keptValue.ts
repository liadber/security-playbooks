import type { FormValue } from './forms.types';

/** The kept value of a single-value field, or undefined if nothing was kept for it. */
export function keptString(values: Record<string, FormValue>, name: string): string | undefined {
  const value = values[name];
  return typeof value === 'string' ? value : undefined;
}

/** The kept values of a multi-value field, or undefined if nothing was kept for it. */
export function keptList(values: Record<string, FormValue>, name: string): string[] | undefined {
  const value = values[name];
  return Array.isArray(value) ? value : undefined;
}
