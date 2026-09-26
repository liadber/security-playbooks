import { describe, expect, it } from 'vitest';
import { ARGON2_MAX_PARAMS, HASH_SEPARATOR } from './auth.constants.js';
import { hashPassword, verifyPassword } from './password.service.js';

describe('password service', () => {
  it('verifies the correct password', async () => {
    const stored = await hashPassword('correct-horse');
    expect(await verifyPassword('correct-horse', stored)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const stored = await hashPassword('correct-horse');
    expect(await verifyPassword('wrong-horse', stored)).toBe(false);
  });

  it('produces a different hash each time for the same password', async () => {
    const first = await hashPassword('same-password');
    const second = await hashPassword('same-password');
    expect(first).not.toBe(second);
  });

  it('never stores the plain password', async () => {
    const stored = await hashPassword('correct-horse');
    expect(stored).not.toContain('correct-horse');
  });

  it('rejects a malformed stored hash without throwing', async () => {
    expect(await verifyPassword('anything', 'not-a-hash')).toBe(false);
    expect(await verifyPassword('anything', '')).toBe(false);
    expect(await verifyPassword('anything', 'bcrypt$10$abc$def')).toBe(false);
  });
});

describe('verifyPassword with tampered hash parameters', () => {
  // Replaces the memory, passes and parallelism fields of a real stored hash.
  async function storedWithParams(memory: string, passes: string, parallelism: string) {
    const parts = (await hashPassword('correct-horse')).split(HASH_SEPARATOR);
    return [parts[0], memory, passes, parallelism, parts[4], parts[5]].join(HASH_SEPARATOR);
  }

  const verify = async (memory: string, passes: string, parallelism: string) =>
    verifyPassword('correct-horse', await storedWithParams(memory, passes, parallelism));

  it('returns false for empty parameters', async () => {
    await expect(verifyPassword('anything', 'argon2id$$$$abc$def')).resolves.toBe(false);
  });

  it('returns false for non-numeric parameters', async () => {
    await expect(verify('lots', '2', '1')).resolves.toBe(false);
    await expect(verify('19456', 'x', '1')).resolves.toBe(false);
    await expect(verify('19456', '2', 'many')).resolves.toBe(false);
  });

  it('returns false for zero or fractional parameters', async () => {
    await expect(verify('0', '2', '1')).resolves.toBe(false);
    await expect(verify('19456', '0', '1')).resolves.toBe(false);
    await expect(verify('19456', '2', '0')).resolves.toBe(false);
    await expect(verify('19456.5', '2', '1')).resolves.toBe(false);
  });

  it('returns false for parameters above their bound', async () => {
    await expect(verify(String(ARGON2_MAX_PARAMS.memory + 1), '2', '1')).resolves.toBe(false);
    await expect(verify('19456', String(ARGON2_MAX_PARAMS.passes + 1), '1')).resolves.toBe(false);
    await expect(verify('19456', '2', String(ARGON2_MAX_PARAMS.parallelism + 1))).resolves.toBe(
      false,
    );
  });

  it('returns false when the memory is too small for the number of lanes', async () => {
    await expect(verify('8', '2', '2')).resolves.toBe(false);
  });

  it('returns false for a salt or hash of the wrong length', async () => {
    const parts = (await hashPassword('correct-horse')).split(HASH_SEPARATOR);
    const shortSalt = [...parts.slice(0, 4), 'abc', parts[5]].join(HASH_SEPARATOR);
    const shortHash = [...parts.slice(0, 5), 'abc'].join(HASH_SEPARATOR);
    await expect(verifyPassword('correct-horse', shortSalt)).resolves.toBe(false);
    await expect(verifyPassword('correct-horse', shortHash)).resolves.toBe(false);
  });
});
