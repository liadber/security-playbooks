import type { RequestHandler } from 'express';
import { SHARED_ERRORS } from '../constants/errors.constants.js';
import { HttpStatus } from '../constants/http-status.constants.js';
import { HttpError } from '../errors/http-error.js';

/**
 * Reached only when no route matched; hands a 404 to the error handler so the
 * JSON shape stays the same as every other error.
 */
export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(HttpStatus.NOT_FOUND, SHARED_ERRORS.ROUTE_NOT_FOUND));
};
