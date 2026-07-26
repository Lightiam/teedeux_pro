import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.ts';
import { round2, users } from '../repository.ts';
import { currentUserId, requireAuth, type AuthedRequest } from '../auth.ts';
import { ApiError, asyncHandler } from '../http.ts';

export const profileRouter = Router();

profileRouter.use(requireAuth);

const updateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    phone: z.string().trim().max(40).nullable().optional(),
    avatarUrl: z.url().nullable().optional(),
    defaultAddress: z.string().trim().min(5).max(200).nullable().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: 'Provide at least one field to update',
  });

const topUpSchema = z.object({
  amount: z.number().positive('Top-up must be greater than zero').max(5000),
});

/** Maps request fields to columns so the SQL below stays a whitelist. */
const UPDATABLE_COLUMNS: Record<string, string> = {
  name: 'name',
  phone: 'phone',
  avatarUrl: 'avatar_url',
  defaultAddress: 'default_address',
};

profileRouter.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = users.publicById(currentUserId(req));
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    res.json({ user });
  })
);

profileRouter.patch(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = updateSchema.parse(req.body);
    const userId = currentUserId(req);

    const assignments: string[] = [];
    const values: (string | null)[] = [];

    for (const [field, column] of Object.entries(UPDATABLE_COLUMNS)) {
      if (field in body) {
        const value = (body as Record<string, unknown>)[field];
        assignments.push(`${column} = ?`);
        values.push(typeof value === 'string' ? value : null);
      }
    }

    if (assignments.length > 0) {
      db.prepare(`UPDATE users SET ${assignments.join(', ')} WHERE id = ?`).run(
        ...values,
        userId
      );
    }

    res.json({ user: users.publicById(userId) });
  })
);

profileRouter.post(
  '/wallet/top-up',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = topUpSchema.parse(req.body);
    const userId = currentUserId(req);

    // No payment provider is wired up; this credits the wallet directly.
    db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(
      round2(body.amount),
      userId
    );

    res.json({ user: users.publicById(userId) });
  })
);
