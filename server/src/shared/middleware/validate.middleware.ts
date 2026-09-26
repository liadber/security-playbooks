import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HttpStatus } from '../constants/http-status.constants.js';

/**
 * Validates req.body against a zod schema. On success the parsed (typed) body replaces
 * req.body; on failure responds 400 with one message per invalid field.
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join('.') || 'body';
        fields[field] ??= issue.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'Validation failed', fields });
      return;
    }

    req.body = result.data;
    next();
  };
}
