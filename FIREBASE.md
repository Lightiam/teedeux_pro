# Firebase backend

An alternative to the Express + SQLite API in `server/`. Both implement the same
REST surface; pick one. `server/` is still the default and is fully verified —
this one is not (see [What is unverified](#what-is-unverified)).

## Why you might want this one

The Express API needs a host with a persistent disk, because SQLite is a file.
That is what rules out Netlify Functions and most serverless platforms. Firebase
sidesteps the problem: Firestore is the database, Cloud Functions are stateless,
and Hosting serves the SPA — nothing needs a disk.

## Layout

```
firebase.json             hosting, functions, firestore, emulator config
firestore.rules           security rules
firestore.indexes.json    composite indexes
.firebaserc.example       copy to .firebaserc with your project id
functions/
  src/
    index.ts              one HTTPS function fronting an Express app
    config.ts             pricing rules, promo codes, collection names
    firestore.ts          Admin SDK init, rounding, search tokenisation
    auth.ts               Firebase ID token verification
    pricing.ts            the only place order maths happens
    repository.ts         Firestore reads and writes
    routes/               auth, catalog, cart, orders, profile
  scripts/
    export-fixtures.ts    src/data/mockData.ts -> functions/fixtures.json
    seed.ts               loads the catalog and a demo account
  test/smoke.test.mjs     checks that need no Firestore
```

## Setup

Requires the **Blaze (pay-as-you-go) plan** — Cloud Functions are not on Spark.
Also needs the Firebase CLI and **JDK 11+** for the emulators.

```bash
npm install -g firebase-tools
cp .firebaserc.example .firebaserc     # then set your project id
cd functions && npm install
```

Enable **Email/Password** under Authentication → Sign-in method in the console.

## Running locally

```bash
cd functions
npm run export:fixtures
npm run build
firebase emulators:start --only functions,firestore,auth,hosting
```

Then seed the emulated database:

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 \
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
GCLOUD_PROJECT=your-project-id \
npm run seed
```

## Deploying

```bash
npm run build                                   # in the repo root: the Vite SPA
firebase deploy --only firestore:rules,firestore:indexes,functions,hosting
```

Hosting rewrites `/api/**` to the function, so the clients keep calling relative
`/api` paths exactly as they do against the Express backend.

---

## Design decisions

### Auth moves to the client

This is the one place the two backends genuinely differ.

The Express API owns password hashing and mints its own JWTs. Firebase Auth
does that for you, and the right way to use it is for the **client** to exchange
credentials with Firebase directly and send the resulting ID token. Passwords
never touch this backend at all, which is most of the reason to be on Firebase
Auth in the first place.

So there is **no `POST /auth/login`** here. Instead:

| Express                     | Firebase                                          |
| --------------------------- | ------------------------------------------------- |
| `POST /auth/login`          | `signInWithEmailAndPassword` (client SDK)         |
| `POST /auth/signup`         | `POST /auth/signup` — creates the account and profile |
| `POST /auth/reset-password` | `sendPasswordResetEmail` (client SDK)             |
| `GET /auth/me`              | `GET /auth/me` — unchanged                        |
| —                           | `POST /auth/ensure-profile` — backfills a profile doc |

Signup stays server-side so the Auth record and the profile document are created
together. `ensure-profile` exists for accounts made elsewhere — a Google sign-in,
or one created in the console — which would otherwise have no profile for the
rest of the API to read.

The upside worth noting: password reset becomes a real emailed, signed,
single-use link. The Express version sets the password directly, which was the
one endpoint I would not have shipped.

### Product search

Firestore has no `LIKE`. Options considered:

1. **Read the collection and filter in the function.** Simplest, and at 29
   products it costs 29 reads per search. Falls apart in the hundreds.
2. **Derived `searchTokens` array + `array-contains-any`.** One indexed query
   regardless of catalog size. Matches whole words only.
3. **Algolia or Typesense.** Real full-text search, plus another service to run
   and pay for.

**Chose 2.** It is the standard Firestore approach and stays correct as the
catalog grows. Tokens are built on write in `buildSearchTokens` from the name,
description, store name and category, lowercased, words of 3+ characters.

The tradeoff is real and worth stating plainly: `"teff"` finds *Simba Teff
Flour*, but `"eff"` finds nothing, because tokens are whole words. If mid-word
matching matters, that is the point to move to option 3 — not to bolt prefix
arrays onto this, which inflates every document.

### Order items are embedded, not a subcollection

An order is always read whole and never grows unbounded, so the items live on
the order document. A subcollection would turn every order list into N+1 reads.

### Costs

The home screen loads stores + aisles + products + buy-it-again + cart. With 29
products that is roughly 40 document reads per cold load. Firestore's free tier
is 50k reads/day, so this is comfortable for development and small usage, and
the first thing to cache if it is not.

`offset()` paging bills for skipped documents. Fine at this size; switch to
cursor paging (`startAfter`) before the catalog gets large.

### Security rules

The rules assume Admin SDK writes bypass them, which is what makes
`allow write: if false` workable — the API can still write.

- **Catalog** — world-readable, never client-writable.
- **Users** — owner-readable, never client-writable. `walletBalance` and
  `loyaltyPoints` live here; a client that could write this could grant itself
  either one.
- **Cart** — the one collection a client may write directly. A cart line holds
  only a product id and a quantity, no price, so tampering yields a wrong cart
  of your own and nothing more. Pricing is recomputed at checkout regardless.
- **Orders** — owner-readable, written only by the checkout function. Totals,
  status and captured prices all live here.

---

## What is unverified

I built and typechecked this but could not run it against Firestore. The machine
had JDK 8; the Firestore emulator needs 11+, and the Firebase CLI was not
installed.

**Verified**

- `tsc --noEmit` and `tsc` both pass; `lib/` compiles
- The compiled entry point loads and exports `api`
- 17 smoke checks against the real Express app inside the function: health,
  routing, the 404 and error envelopes, auth rejection on all six protected
  routes, invalid-token handling, and zod validation

**Not verified — exercise these first**

- Every Firestore read and write
- The checkout transaction, including the per-hub split and cart clearing
- Security rules (write rules tests with `@firebase/rules-unit-testing`)
- Composite indexes — Firestore will tell you at query time if one is missing
- The seed script against a real or emulated database

Once the emulators are running, `server/test/api.test.mjs` is the fastest way to
get real coverage: point `API_URL` at the emulated function and the 60 existing
checks apply, minus the login test, which no longer exists here.

```bash
API_URL=http://localhost:5001/your-project-id/us-central1/api node server/test/api.test.mjs
```
