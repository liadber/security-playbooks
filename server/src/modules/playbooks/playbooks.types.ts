import type { ActionCode, TriggerCode } from '@shared/types/playbook.js';
import type { Types } from 'mongoose';

/** A stored playbook; codes only, labels exist in code. */
export interface IPlaybook {
  userId: Types.ObjectId;
  name: string;
  trigger: TriggerCode;
  actions: ActionCode[];
}
