import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Firebase web config.
 *
 * These values are public by design — they ship inside the client bundle and
 * identify the project rather than granting access to it. Access is governed by
 * Firestore security rules and Firebase Auth. The service account key, which is
 * secret, is never used by a client.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

/**
 * Whether Firebase Auth should be used at all.
 *
 * Detected from config rather than a mode flag, so a checkout with no Firebase
 * env vars keeps working against the Express backend and its own JWTs instead
 * of failing at startup.
 */
export const isFirebaseConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.appId
);

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;

/** Initialised lazily so an unconfigured build never loads the SDK at all. */
export function firebaseAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured; check VITE_FIREBASE_* environment variables');
  }

  if (!authInstance) {
    app = initializeApp({
      apiKey: config.apiKey!,
      authDomain: config.authDomain!,
      projectId: config.projectId!,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId!,
    });
    authInstance = getAuth(app);
  }

  return authInstance;
}

/**
 * Maps Firebase's error codes to something the reader can act on.
 *
 * Raw codes read like "auth/invalid-credential", and Firebase sometimes
 * appends prose to them — "auth/api-key-not-valid.-please-pass-a-valid-api-
 * key." — so codes are matched by prefix rather than equality.
 */
export function describeAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? '';
  const has = (...prefixes: string[]) => prefixes.some((prefix) => code.startsWith(prefix));

  // Configuration faults. These are aimed at whoever is wiring the project up,
  // not at a shopper, because a shopper can do nothing about them.
  if (has('auth/api-key-not-valid', 'auth/invalid-api-key')) {
    return 'Firebase rejected the API key. Check VITE_FIREBASE_API_KEY against the console.';
  }
  if (has('auth/configuration-not-found', 'auth/operation-not-allowed')) {
    return 'Email/password sign-in is not enabled for this Firebase project. Enable it under Authentication → Sign-in method.';
  }
  if (has('auth/project-not-found', 'auth/invalid-app-id')) {
    return 'That Firebase project or app id was not found. Check VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_APP_ID.';
  }
  if (has('auth/unauthorized-domain')) {
    return 'This domain is not authorised for sign-in. Add it under Authentication → Settings → Authorized domains.';
  }

  // Everything a shopper can actually respond to.
  if (has('auth/invalid-email')) return 'That email address is not valid';
  if (has('auth/user-disabled')) return 'That account has been disabled';
  if (has('auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential')) {
    // Deliberately identical, so the form cannot be used to work out which
    // email addresses have accounts.
    return 'Email or password is incorrect';
  }
  if (has('auth/email-already-in-use')) return 'An account with that email already exists';
  if (has('auth/weak-password')) return 'Password must be at least 8 characters';
  if (has('auth/too-many-requests')) return 'Too many attempts. Try again in a few minutes';
  if (has('auth/network-request-failed')) return 'Cannot reach Firebase. Check your connection';

  return error instanceof Error ? error.message : 'Authentication failed';
}
