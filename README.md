# Teedeux Mart — archived

> **The active app now lives at
> [Lightiam/teedeux-joy-maker](https://github.com/Lightiam/teedeux-joy-maker).**
>
> That repo is where Lovable writes, it has a working server-side checkout, and
> it adds admin, driver and god-view screens this one never had. It reuses the
> components built here — `QuantityStepper`, `ProductTile`, `RetailerCard`,
> `SectionRail` and the screens — on a Supabase backend.
>
> Nothing here is deleted. The React Native app, the Capacitor wrapper and the
> Express API with its 60 passing tests all still work; they are simply no
> longer maintained. Read on if you need one of them.

Mobile grocery-delivery app for authentic African and diaspora groceries,
delivered nationwide across all 50 US states. The shopping experience follows
the patterns established by Instacart — retailer carousel, buy-it-again, aisle
browsing, per-hub carts — dressed in Teedeux's own brand.

## Why this repo was retired

Two backends were built here. Both hit walls that the Supabase one does not:

- **Express + SQLite** (`server/`) — complete and fully tested, but SQLite is a
  file, so it needs a host with a persistent disk. That rules out Netlify
  Functions and most serverless platforms.
- **Firebase Functions + Firestore** (`functions/`) — written and typechecked,
  but never deployable from here: the available credentials are refused
  `cloudfunctions.functions.create`, `serviceusage.services.enable` and
  `firebaserules.releases.update`.

The Firebase build did reach production at `teedeux-d7927.web.app` with
authentication, catalog and cart working against Firestore directly. Checkout
was the piece that could not be finished, because order totals must be computed
somewhere a shopper cannot reach.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Material Symbols (icon font)

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000`. It is laid out mobile-first: on a desktop
browser it renders as a centred 430 px device frame, and full-bleed on a handset.

Other scripts:

```bash
npm run build    # production bundle into dist/
npm run preview  # serve the production build
npm run lint     # tsc --noEmit
```

## Architecture

```
src/
  App.tsx              screen router, navigation history, app-level state
  types.ts             shared domain types
  hooks/
    useCart.ts         cart state; flat item list, grouped per store on read
  data/
    mockData.ts        stores, products, aisles, transactions, order history
  components/
    ui/                shared primitives (see below)
    HomeScreen.tsx     retailer carousel, buy-it-again, aisle grid, curated rows
    StoresScreen.tsx   Browse — full catalog with aisle filter, plus a hubs tab
    StoreDetailScreen  a single hub's catalog, filtered by the aisles it stocks
    ...                auth, onboarding, cart, tracking, profile, payments
```

### UI primitives

| Component         | Role                                                               |
| ----------------- | ------------------------------------------------------------------ |
| `QuantityStepper` | Round `+` that expands into a −/qty/+ pill once an item is in cart  |
| `ProductTile`     | Image-dominant card with the stepper floating over the image        |
| `RetailerCard`    | Hub card — rail variant for carousels, row variant for lists        |
| `SectionRail`     | Titled horizontal scroller with a "See all" affordance              |
| `BottomSheet`     | Modal sheet with scroll locking and Escape-to-close                 |

### Navigation

`App.tsx` holds a `ScreenId` plus a history stack. Navigating to a tab root
(`home`, `stores`, `buy-it-again`, `cart`, `profile`) clears the stack; navigating
anywhere else pushes onto it, which is what drives the header's back arrow.

### Carts

Items live in one flat list and are grouped by `storeId` on read (`useCart`).
Each fulfilment hub therefore gets its own cart with its own subtotal and item
count, since hubs ship independently.

## Backend

There are two interchangeable backends implementing the same REST surface.

| | `server/` | `functions/` |
| --- | --- | --- |
| Stack | Express 5 + SQLite | Cloud Functions + Firestore |
| Auth | Own JWTs, bcrypt | Firebase Auth |
| Needs | A host with a disk | Blaze plan |
| Status | Default, fully verified | Built, not run against Firestore |

**Express** — see [server/README.md](server/README.md):

```bash
cd server
npm install
npm run seed
npm run dev     # http://localhost:4000
```

**Firebase** — see [FIREBASE.md](FIREBASE.md). Worth it if you want to avoid
running a server with a persistent disk, which is what rules the Express version
out of Netlify Functions.

Both clients call relative `/api` paths, so switching backends is a proxy or
rewrite change, not a code change — with one exception: Firebase moves sign-in
to the client SDK, so there is no `POST /auth/login` there. FIREBASE.md has the
mapping.

## Deploying the web app

`netlify.toml` configures a Netlify deploy: `npm run build` into `dist`, an SPA
fallback, long-lived caching for fingerprinted assets, and security headers.

Two things need doing before it works end to end:

1. **Deploy the API separately, then uncomment the `/api/*` redirect** in
   `netlify.toml` and point it at that host. The rule ships commented out on
   purpose — Netlify validates the redirect set at deploy time, and a rule with
   an unresolvable placeholder host can invalidate the whole block, taking the
   SPA fallback with it and 404-ing every route.

   Netlify Functions cannot host this API: it is a long-running Express process
   backed by a SQLite file, and Functions have an ephemeral per-invocation
   filesystem, so every write would be lost. Use a host with a persistent disk
   (Fly.io, Railway, Render, a VM) — or switch to the Firebase backend, which
   has no such constraint.

2. **Add your Netlify origin to the API's `CORS_ORIGINS`.** Requests proxied
   through the redirect arrive same-origin, but any direct call — the Capacitor
   build, for instance — will not be.

The client calls relative `/api` paths in development and production alike, so
no build-time URL is needed unless something calls the API cross-origin. In that
case set `VITE_API_URL`.

## Shipping as a native app

There are two native paths in this repo, and they are independent:

| Path                | Location  | What it is                                                    |
| ------------------- | --------- | ------------------------------------------------------------- |
| Capacitor           | this repo | Ships *this* web build inside a native WebView shell           |
| React Native / Expo | `mobile/` | A separate, genuinely native implementation — see its own README |

### Capacitor

```bash
npm run cap:sync        # build + copy the web assets into the native projects
npm run cap:android     # build, sync, then open Android Studio
npm run cap:ios         # build, sync, then open Xcode (macOS only)
```

The native projects are generated, not committed. Create them once per checkout:

```bash
npx cap add android
npx cap add ios
```

Building an APK needs the Android SDK and JDK 17+; iOS needs Xcode on macOS.

`src/native.ts` holds the shell integration — status-bar styling, splash
dismissal, and routing the Android hardware back button through the app's own
navigation history. Every entry point checks `Capacitor.isNativePlatform()`
first and the plugin imports are dynamic, so a browser build never loads them.

## Data

The catalog is 29 products across 4 fulfilment hubs. It lives in
`src/data/mockData.ts`, but the app no longer reads that file — it is the seed
source for both backends, and the clients fetch everything over HTTP.
