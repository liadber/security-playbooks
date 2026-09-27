import { Schema, model } from 'mongoose';
import { ACTION_CODES, NAME_COLLATION, TRIGGER_CODES } from './playbooks.constants.js';
import type { IPlaybook } from './playbooks.types.js';

const playbookSchema = new Schema<IPlaybook>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    trigger: { type: String, required: true, enum: TRIGGER_CODES },
    actions: { type: [{ type: String, enum: ACTION_CODES }], required: true },
  },
  { timestamps: true },
);

/**
 * One name per user, compared case-insensitively. The index enforces it, so two
 * concurrent creates cannot both succeed the way a find-then-save check would allow.
 */
playbookSchema.index({ userId: 1, name: 1 }, { unique: true, collation: NAME_COLLATION });

export const Playbook = model<IPlaybook>('Playbook', playbookSchema);
