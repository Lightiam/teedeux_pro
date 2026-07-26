import type { NextFunction, Request, Response } from 'express';
import { auth } from './firestore.js';
import { ApiError } from './http.js';

export interface AuthedRequest extends Request {
  uid?: string;
}

function readBearer(req: Request): string | null {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

/**
 * Verifies a Firebase Auth ID token.
 *
 * `checkRevoked` costs an extra lookup but means a signed-out or disabled
 * account stops working immediately rather than at token expiry.
 */
async function uidFromToken(token: string): Promise<string | null> {
  try {
    const decoded = await auth.verifyIdToken(token, true);
    return decoded.uid;
  } catch {
    // Expired, malformed, revoked or wrongly signed — all mean "not authenticated".
    return null;
  }
}

/** Rejects the request unless it carries a valid Firebase ID token. */
export async function requireAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = readBearer(req);
  if (!token) {
    next(ApiError.unauthorized('Missing bearer token'));
    return;
  }

  const uid = await uidFromToken(token);
  if (!uid) {
    next(ApiError.unauthorized('Invalid or expired token', 'invalid_token'));
    return;
  }

  req.uid = uid;
  next();
}

/** Populates `req.uid` when a token is present, but never rejects. */
export async function optionalAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = readBearer(req);
  if (token) {
    const uid = await uidFromToken(token);
    if (uid) req.uid = uid;
  }
  next();
}

/** Narrows `req.uid` for handlers mounted behind `requireAuth`. */
export function currentUid(req: AuthedRequest): string {
  if (!req.uid) throw ApiError.unauthorized();
  return req.uid;
}
