import { Router } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { COLLECTIONS } from '../config.js';
import { db, round2 } from '../firestore.js';
import { users } from '../repository.js';
import { currentUid, requireAuth, type AuthedRequest } from '../auth.js';
import { ApiError, asyncHandler } from '../http.js';

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

/** Whitelist of fields a client may write, so an update cannot set anything else. */
const UPDATABLE_FIELDS = ['name', 'phone', 'avatarUrl', 'defaultAddress'] as const;

profileRouter.get(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await users.publicById(currentUid(req));
    if (!user) throw ApiError.unauthorized('Account has no profile yet', 'no_profile');
    res.json({ user });
  })
);

profileRouter.patch(
  '/',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = updateSchema.parse(req.body);
    const uid = currentUid(req);

    const update: Record<string, unknown> = {};
    for (const field of UPDATABLE_FIELDS) {
      if (field in body) {
        update[field] = (body as Record<string, unknown>)[field] ?? null;
      }
    }

    if (Object.keys(update).length > 0) {
      await db.collection(COLLECTIONS.users).doc(uid).update(update);
    }

    res.json({ user: await users.publicById(uid) });
  })
);

profileRouter.post(
  '/wallet/top-up',
  asyncHandler(async (req: AuthedRequest, res) => {
    const body = topUpSchema.parse(req.body);
    const uid = currentUid(req);

    // No payment provider is wired up; this credits the wallet directly.
    // increment() is atomic, so concurrent top-ups cannot lose one another.
    await db
      .collection(COLLECTIONS.users)
      .doc(uid)
      .update({ walletBalance: FieldValue.increment(round2(body.amount)) });

    res.json({ user: await users.publicById(uid) });
  })
);
