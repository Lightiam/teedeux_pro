import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Functions can cold-start more than once per container; guard the init.
if (getApps().length === 0) {
  initializeApp();
}

export const db = getFirestore();
export const auth = getAuth();

/** Money is stored as a number; round on the way out so totals never show fractions of a cent. */
export const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Builds the token list used for product search.
 *
 * Firestore has no LIKE operator. Splitting the searchable text into
 * lowercased words lets `array-contains-any` serve whole-word queries such as
 * "teff" or "suya". It deliberately does not match mid-word substrings — see
 * the search note in the README for when that becomes worth replacing.
 */
export function buildSearchTokens(...sources: Array<string | null | undefined>): string[] {
  const tokens = new Set<string>();

  for (const source of sources) {
    if (!source) continue;
    for (const word of source.toLowerCase().split(/[^a-z0-9]+/)) {
      // One- and two-letter fragments match almost everything; they add index
      // weight without narrowing a search.
      if (word.length >= 3) tokens.add(word);
    }
  }

  // array-contains-any accepts at most 30 values, and a document's token list
  // is what a query is matched against — keep it bounded.
  return Array.from(tokens).slice(0, 60);
}
