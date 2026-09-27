import { describe, expect, it } from 'vitest';
import { MONGO_DUPLICATE_KEY_CODE } from './db.constants.js';
import { isDuplicateKeyError } from './duplicate-key.js';

describe('isDuplicateKeyError', () => {
  it('recognizes the duplicate-key code', () => {
    expect(isDuplicateKeyError({ code: MONGO_DUPLICATE_KEY_CODE })).toBe(true);
  });

  it('is false for anything else', () => {
    expect(isDuplicateKeyError({ code: 121 })).toBe(false);
    expect(isDuplicateKeyError(new Error('boom'))).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
    expect(isDuplicateKeyError(undefined)).toBe(false);
  });
});
