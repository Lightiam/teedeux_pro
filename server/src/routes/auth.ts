import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.ts';
import { users } from '../repository.ts';
import { toPublicUser } from '../repository.ts';
import {
  currentUserId,
  hashPassword,
  newId,
  requireAuth,
  signToken,
  verifyPassword,
  type AuthedRequest,
} from '../auth.ts';
import { ApiError, asyncHandler } from '../http.ts';

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  phone: z.string().trim().max(40).optional(),
});

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const resetSchema = z.object({
  email: z.email('Enter a valid email address'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(200),
});

authRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const body = signupSchema.parse(req.body);

    if (users.byEmail(body.email)) {
      throw ApiError.conflict('An account with that email already exists', 'email_taken');
    }

    const id = newId('usr');
    db.prepare(
      `INSERT INTO users (id, name, email, password_hash, phone, is_plus_member,
                          wallet_balance, loyalty_points, created_at)
       VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?)`
    ).run(
      id,
      body.name,
      body.email,
      await hashPassword(body.password),
      body.phone ?? null,
      new Date().toISOString()
    );

    const row = users.byId(id);
    if (!row) throw new Error('User vanished immediately after insert');

    res.status(201).json({ token: signToken(id), user: toPublicUser(row) });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const row = users.byEmail(body.email);

    // Same message either way, so the response can't be used to enumerate
    // which email addresses have accounts.
    const invalid = ApiError.unauthorized('Email or password is incorrect', 'invalid_credentials');
    if (!row || typeof row.password_hash !== 'string') throw invalid;
    if (!(await verifyPassword(body.password, row.password_hash))) throw invalid;

    const id = String(row.id);
    res.json({ token: signToken(id), user: toPublicUser(row) });
  })
);

/**
 * Development-grade reset: sets a new password directly.
 *
 * A production flow would email a signed, single-use, expiring token and only
 * accept the new password alongside it. Without a mail provider wired up, this
 * endpoint exists so the reset screen has something to call.
 */
authRouter.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const body = resetSchema.parse(req.body);
    const row = users.byEmail(body.email);

    // Always report success so the endpoint can't confirm which emails exist.
    if (row) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(
        await hashPassword(body.newPassword),
        String(row.id)
      );
    }

    res.json({ ok: true, message: 'If that account exists, its password has been reset' });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = users.publicById(currentUserId(req));
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    res.json({ user });
  })
);
