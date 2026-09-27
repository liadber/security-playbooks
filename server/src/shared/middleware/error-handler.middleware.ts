import type { ErrorRequestHandler } from 'express';
import { SHARED_ERRORS } from '../constants/errors.constants.js';
import { HttpStatus } from '../constants/http-status.constants.js';
import { HttpError } from '../errors/http-error.js';

/** Express recognizes an error handler by its 4-argument signature, so `next` must stay. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: SHARED_ERRORS.INTERNAL });
};
