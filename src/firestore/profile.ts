import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { firestore } from './client';
import type { ApiUser } from '../api/types';

/**
 * Builds the app's user from the Firebase Auth account, then layers on the
 * Firestore profile document when one exists.
 *
 * The Auth account is the fallback because it always exists after sign-in,
 * whereas the profile document is written by Cloud Functions — which may not be
 * deployed. Without that fallback a shopper could authenticate and still be
 * bounced back to the login screen for want of a document.
 *
 * walletBalance and loyaltyPoints default to zero. They are only ever real when
 * the server has written them; the rules forbid a client from doing so.
 */
export async function loadProfile(user: User): Promise<ApiUser> {
  const base: ApiUser = {
    id: user.uid,
    name: user.displayName ?? user.email?.split('@')[0] ?? 'Shopper',
    email: user.email ?? '',
    phone: user.phoneNumber,
    avatarUrl: user.photoURL,
    isPlusMember: false,
    walletBalance: 0,
    loyaltyPoints: 0,
    defaultAddress: null,
  };

  try {
    const snap = await getDoc(doc(firestore(), 'users', user.uid));
    if (!snap.exists()) return base;

    const data = snap.data();
    return {
      ...base,
      name: typeof data.name === 'string' ? data.name : base.name,
      email: typeof data.email === 'string' ? data.email : base.email,
      phone: typeof data.phone === 'string' ? data.phone : base.phone,
      avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : base.avatarUrl,
      isPlusMember: data.isPlusMember === true,
      walletBalance: typeof data.walletBalance === 'number' ? data.walletBalance : 0,
      loyaltyPoints: typeof data.loyaltyPoints === 'number' ? data.loyaltyPoints : 0,
      defaultAddress:
        typeof data.defaultAddress === 'string' ? data.defaultAddress : base.defaultAddress,
    };
  } catch {
    // Rules deny the read, or Firestore is unreachable. The Auth-derived
    // account is still a usable session, so sign-in should not fail here.
    return base;
  }
}
