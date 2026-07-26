import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { config } from './config.ts';
import { ApiError } from './http.ts';

const SALT_ROUNDS = 10;

export interface AuthedRequest extends Request {
  userId?: string;
}

export const hashPassword = (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

export const newId = (prefix: string): string => `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 20)}`;

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

function readBearer(req: Request): string | null {
  const header = req.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

function userIdFromToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (typeof payload === 'string' || typeof payload.sub !== 'string') return null;
    return payload.sub;
  } catch {
    // Expired, malformed or wrongly signed — all mean "not authenticated".
    return null;
  }
}

/** Rejects the request unless it carries a valid bearer token. */
export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const token = readBearer(req);
  if (!token) {
    next(ApiError.unauthorized('Missing bearer token'));
    return;
  }

  const userId = userIdFromToken(token);
  if (!userId) {
    next(ApiError.unauthorized('Invalid or expired token', 'invalid_token'));
    return;
  }

  req.userId = userId;
  next();
}

/** Populates `req.userId` when a token is present, but never rejects. */
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const token = readBearer(req);
  if (token) {
    const userId = userIdFromToken(token);
    if (userId) req.userId = userId;
  }
  next();
}

/** Narrows `req.userId` for handlers mounted behind `requireAuth`. */
export function currentUserId(req: AuthedRequest): string {
  if (!req.userId) {
    throw ApiError.unauthorized();
  }
  return req.userId;
}
