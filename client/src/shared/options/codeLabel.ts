import type { CodeOption } from '@shared/types/playbook';

/** The label of a code in an options list, or the code itself if the list does not know it. */
export function codeLabel<Code extends string>(options: CodeOption<Code>[], code: Code): string {
  return options.find((option) => option.code === code)?.label ?? code;
}
