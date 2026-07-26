# Teedeux Mart — native app

React Native / Expo build of Teedeux Mart. Same shopping model as the web app in
the repo root: retailer carousel, buy-it-again, aisle browsing, per-hub carts.

## Getting started

```bash
npm install
npm start
```

Then press `a` for Android, `i` for iOS (macOS only), or `w` for web. Scanning
the QR code with Expo Go runs it on a physical device.

Other scripts:

```bash
npm run lint          # tsc --noEmit
npm run sync:shared   # refresh src/shared from the web app
```

## The API

The app talks to the backend in `server/`. Start it first:

```bash
cd ../server && npm run seed && npm run dev
```

`localhost` on a device or emulator is the device, not your machine, so the
default base URL differs by platform: `10.0.2.2:4000` on the Android emulator,
`localhost:4000` on the iOS simulator. On a physical device set your LAN address:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 npm start
```

Add that origin to the server's `CORS_ORIGINS` too.

Sign in with the demo account:

```
marcus.vance@example.com / teedeux1234
```

## Shared code

`src/shared/types.ts` is copied from the web app's `src/types.ts` — a generated
file. Edit the web app's copy, then run `npm run sync:shared`.

Only types are shared. Catalog data and cart logic live on the server and reach
both clients over HTTP, so there is nothing else to keep in step.

Why copy rather than import across directories: Metro will not resolve modules
outside the Expo project root unless the repository is laid out as a real
monorepo with workspace symlinks. Restructuring the web app into a workspace
package was more disruption than one file of types was worth.

## Architecture

```
App.tsx                     providers; gates splash / sign-in / shop
src/
  theme.ts                  brand tokens mirroring the web CSS variables
  api/                      typed client and endpoint wrappers
  AuthContext.tsx           session; token persisted with AsyncStorage
  CatalogContext.tsx        stores, products, aisles, buy-it-again
  CartContext.tsx           server-backed cart with optimistic updates
  navigation/
    types.ts                typed route params
    RootNavigator.tsx       stack over a 5-tab bottom navigator
  components/
    QuantityStepper.tsx     round + that expands into a -/qty/+ pill
    ProductTile.tsx         image-dominant card, stepper over the image
    RetailerCard.tsx        hub card, rail and row variants
    SectionRail.tsx         titled horizontal scroller
  screens/
    SignInScreen,
    HomeScreen, BrowseScreen, BuyAgainScreen,
    CartsScreen, AccountScreen,
    StoreDetailScreen, ProductDetailScreen
```

### Cart

Mutations apply locally first so a stepper tap responds on the same frame, then
reconcile with the server's response. Requests are serialised through a queue:
the add endpoint is relative ("add one"), so two in flight at once would race
and lose an increment. Totals are never recomputed on the client — the figure
shown is the one the server calculated.

### Navigation

A native stack wraps the tab navigator. Tabs are Home / Browse / Buy again /
Carts / Account; store and product detail push onto the stack above them, so
they get a native back gesture and header.

Grid tiles are sized from `useWindowDimensions` rather than flex, so two columns
line up with a fixed gutter on any screen width.
