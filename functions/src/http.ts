import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from 'firebase-functions';

/** An error carrying the HTTP status the client should see. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code = 'error'
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static badRequest(message: string, code = 'bad_request') {
    return new ApiError(400, message, code);
  }
  static unauthorized(message = 'Authentication required', code = 'unauthorized') {
    return new ApiError(401, message, code);
  }
  static notFound(message = 'Not found', code = 'not_found') {
    return new ApiError(404, message, code);
  }
  static conflict(message: string, code = 'conflict') {
    return new ApiError(409, message, code);
  }
}

/** Wraps an async handler so a rejected promise reaches Express's error pipeline. */
export function asyncHandler<T extends Request>(
  handler: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'not_found', message: 'No such endpoint' } });
}

/** Terminal error handler. Never leaks internals to the client. */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  // Express identifies the error handler by arity, so `next` must stay.
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'validation_failed',
        message: 'Request body failed validation',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }

  logger.error('Unhandled error', error);
  res.status(500).json({ error: { code: 'internal_error', message: 'Something went wrong' } });
}
