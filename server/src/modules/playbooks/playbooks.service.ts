import type {
  ActionCode,
  Playbook as PlaybookResponse,
  PlaybookInput,
  PlaybookOptions,
  TriggerCode,
} from '@shared/types/playbook.js';
import { isValidObjectId, type HydratedDocument, type QueryFilter } from 'mongoose';
import { HttpStatus } from '../../shared/constants/http-status.constants.js';
import { isDuplicateKeyError } from '../../shared/db/duplicate-key.js';
import { HttpError } from '../../shared/errors/http-error.js';
import { Playbook } from './playbook.model.js';
import {
  ACTION_CODES,
  ACTION_LABELS,
  NAME_COLLATION,
  PLAYBOOK_NAME_MAX_LENGTH,
  TRIGGER_CODES,
  TRIGGER_LABELS,
} from './playbooks.constants.js';
import type { IPlaybook } from './playbooks.types.js';

/** Everything a client needs to build a playbook, so these rules live only on the server. */
export function getPlaybookOptions(): PlaybookOptions {
  return {
    triggers: TRIGGER_CODES.map((code) => ({ code, label: TRIGGER_LABELS[code] })),
    actions: ACTION_CODES.map((code) => ({ code, label: ACTION_LABELS[code] })),
    nameMaxLength: PLAYBOOK_NAME_MAX_LENGTH,
  };
}

export function listPlaybooks(userId: string): Promise<PlaybookResponse[]> {
  return findSortedByName({ userId });
}

export function findPlaybooksByTrigger(
  userId: string,
  trigger: TriggerCode,
): Promise<PlaybookResponse[]> {
  return findSortedByName({ userId, trigger });
}

export async function createPlaybook(
  userId: string,
  input: PlaybookInput,
): Promise<PlaybookResponse> {
  try {
    // userId comes last so the logged-in user's id wins by construction, whatever the body held.
    const doc = await Playbook.create({
      ...input,
      userId,
      actions: canonicalOrder(input.actions),
    });
    return toResponse(doc);
  } catch (err) {
    throw nameConflictOr(err);
  }
}

export async function updatePlaybook(
  userId: string,
  id: string,
  patch: Partial<PlaybookInput>,
): Promise<PlaybookResponse> {
  const update = patch.actions ? { ...patch, actions: canonicalOrder(patch.actions) } : patch;
  const doc = await Playbook.findOneAndUpdate(ownedBy(userId, id), update, {
    new: true,
    runValidators: true,
  }).catch((err: unknown) => {
    throw nameConflictOr(err);
  });
  if (!doc) throw notFound();
  return toResponse(doc);
}

export async function deletePlaybook(userId: string, id: string): Promise<void> {
  const doc = await Playbook.findOneAndDelete(ownedBy(userId, id));
  if (!doc) throw notFound();
}

/**
 * Every list of playbooks is sorted by name the way the unique index compares names
 * (NAME_COLLATION), so "apple" sorts before "Banana" instead of after every capital.
 */
async function findSortedByName(filter: QueryFilter<IPlaybook>): Promise<PlaybookResponse[]> {
  const docs = await Playbook.find(filter).collation(NAME_COLLATION).sort({ name: 1 });
  return docs.map(toResponse);
}

/**
 * One lookup answers both "does it exist?" and "is it yours?", so a foreign playbook
 * gets the same 404 as a missing one and its id is never confirmed. An id that is not
 * an ObjectId cannot match anything, and checking it first keeps Mongoose from throwing.
 */
function ownedBy(userId: string, id: string): { _id: string; userId: string } {
  if (!isValidObjectId(id)) throw notFound();
  return { _id: id, userId };
}

function notFound(): HttpError {
  return new HttpError(HttpStatus.NOT_FOUND, 'Playbook not found');
}

function nameConflictOr(err: unknown): unknown {
  return isDuplicateKeyError(err)
    ? new HttpError(HttpStatus.CONFLICT, 'A playbook with this name already exists')
    : err;
}

/** ACTION_CODES order, whatever order the client sent. */
function canonicalOrder(actions: ActionCode[]): ActionCode[] {
  return ACTION_CODES.filter((code) => actions.includes(code));
}

/** Only the contract fields: no userId, no timestamps, no __v. */
function toResponse(doc: HydratedDocument<IPlaybook>): PlaybookResponse {
  return { id: doc.id, name: doc.name, trigger: doc.trigger, actions: [...doc.actions] };
}
