import type { ActionCode, TriggerCode } from '@shared/types/playbook.js';
import type { Types } from 'mongoose';

/** A stored playbook; codes only, labels exist in code. */
export interface IPlaybook {
  userId: Types.ObjectId;
  name: string;
  trigger: TriggerCode;
  actions: ActionCode[];
}

/**
 * Route parameters of /playbooks/:id. The index signature keeps the type compatible with
 * Express's ParamsDictionary, so handlers typed with it accept the shared middleware.
 */
export interface PlaybookParams {
  id: string;
  [key: string]: string;
}
