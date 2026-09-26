import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
import { DEFAULT_PORT } from './config.constants.js';

const validEnv = {
  MONGODB_URI: 'mongodb://localhost:27017/test',
  JWT_SECRET: 'test-secret',
  COOKIE_SECURE: 'false',
};

describe('loadConfig', () => {
  it('returns a typed config when every variable is set', () => {
    expect(loadConfig({ ...validEnv, PORT: '5000' })).toEqual({
      port: 5000,
      mongodbUri: validEnv.MONGODB_URI,
      jwtSecret: validEnv.JWT_SECRET,
      cookieSecure: false,
    });
  });

  it('falls back to the default port when PORT is not set', () => {
    expect(loadConfig(validEnv).port).toBe(DEFAULT_PORT);
  });

  it('parses COOKIE_SECURE=true into a boolean', () => {
    expect(loadConfig({ ...validEnv, COOKIE_SECURE: 'true' }).cookieSecure).toBe(true);
  });

  it('throws a clear error when a required variable is missing', () => {
    expect(() =>
      loadConfig({ MONGODB_URI: validEnv.MONGODB_URI, COOKIE_SECURE: validEnv.COOKIE_SECURE }),
    ).toThrow('JWT_SECRET is required');
  });

  it('names every missing variable in one error', () => {
    expect(() => loadConfig({})).toThrow(
      /MONGODB_URI is required.*JWT_SECRET is required.*COOKIE_SECURE is required/,
    );
  });

  it('throws when a required variable is empty', () => {
    expect(() => loadConfig({ ...validEnv, MONGODB_URI: '' })).toThrow(
      'MONGODB_URI must not be empty',
    );
  });

  it('throws when COOKIE_SECURE is neither true nor false', () => {
    expect(() => loadConfig({ ...validEnv, COOKIE_SECURE: 'yes' })).toThrow(
      'COOKIE_SECURE must be true or false',
    );
  });

  it('throws when PORT is not a positive integer', () => {
    expect(() => loadConfig({ ...validEnv, PORT: 'abc' })).toThrow('Invalid configuration: PORT');
    expect(() => loadConfig({ ...validEnv, PORT: '0' })).toThrow('Invalid configuration: PORT');
  });

  it('does not read process.env when an env object is given', () => {
    expect(() => loadConfig({})).toThrow();
  });
});
