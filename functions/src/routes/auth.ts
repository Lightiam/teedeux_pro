import { Router } from 'express';
import { z } from 'zod';
import { COLLECTIONS } from '../config.js';
import { auth, db } from '../firestore.js';
import { users } from '../repository.js';
import { currentUid, requireAuth, type AuthedRequest } from '../auth.js';
import { ApiError, asyncHandler } from '../http.js';

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  phone: z.string().trim().max(40).optional(),
});

/**
 * Creates the Firebase Auth account and its profile document.
 *
 * Sign-in itself happens on the client with the Firebase Auth SDK — passwords
 * never reach this backend, which is the main reason to be on Firebase Auth at
 * all. There is deliberately no /auth/login here; the client exchanges
 * credentials with Firebase directly and sends the resulting ID token.
 */
authRouter.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const body = signupSchema.parse(req.body);

    let uid: string;
    try {
      // Phone is kept on the profile document rather than the Auth record:
      // Firebase requires E.164 there and rejects anything else outright.
      const record = await auth.createUser({
        email: body.email,
        password: body.password,
        displayName: body.name,
      });
      uid = record.uid;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/email-already-exists') {
        throw ApiError.conflict('An account with that email already exists', 'email_taken');
      }
      if (code === 'auth/invalid-password') {
        throw ApiError.badRequest('Password is too weak', 'weak_password');
      }
      throw error;
    }

    await db
      .collection(COLLECTIONS.users)
      .doc(uid)
      .set({
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        avatarUrl: null,
        isPlusMember: false,
        walletBalance: 0,
        loyaltyPoints: 0,
        defaultAddress: null,
        createdAt: new Date().toISOString(),
      });

    const user = await users.publicById(uid);
    res.status(201).json({ user });
  })
);

/**
 * Ensures a profile document exists for an already-authenticated account.
 *
 * Accounts created outside this API — a Google sign-in, or one made in the
 * Firebase console — have no profile document. The client calls this after its
 * first successful sign-in so the rest of the API has something to read.
 */
authRouter.post(
  '/ensure-profile',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const uid = currentUid(req);
    const ref = db.collection(COLLECTIONS.users).doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      const record = await auth.getUser(uid);
      await ref.set({
        name: record.displayName ?? record.email?.split('@')[0] ?? 'Shopper',
        email: record.email ?? '',
        phone: record.phoneNumber ?? null,
        avatarUrl: record.photoURL ?? null,
        isPlusMember: false,
        walletBalance: 0,
        loyaltyPoints: 0,
        defaultAddress: null,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ user: await users.publicById(uid) });
  })
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await users.publicById(currentUid(req));
    if (!user) throw ApiError.unauthorized('Account has no profile yet', 'no_profile');
    res.json({ user });
  })
);
