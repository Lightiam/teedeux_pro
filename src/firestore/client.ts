import { getApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseAuth } from '../auth/firebase';

let db: Firestore | undefined;

/**
 * Firestore handle for the already-initialised Firebase app.
 *
 * Calling firebaseAuth() first guarantees initializeApp has run — the auth
 * module owns that, and duplicating it here would register a second app.
 */
export function firestore(): Firestore {
  if (!db) {
    firebaseAuth();
    db = getFirestore(getApp());
  }
  return db;
}
