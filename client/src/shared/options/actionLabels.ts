import type { ActionCode, CodeOption } from '@shared/types/playbook';
import { codeLabel } from './codeLabel';
import { ACTION_SEPARATOR } from './options.constants';

/** The labels of the actions in the given order, joined as a sequence ("Isolate Host → Block IP"). */
export function actionLabels(options: CodeOption<ActionCode>[], codes: ActionCode[]): string {
  return codes.map((code) => codeLabel(options, code)).join(ACTION_SEPARATOR);
}
