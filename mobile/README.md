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

## Shared code

`src/shared/` holds three modules copied from the web app's `src/`:

| File          | Source                    |
| ------------- | ------------------------- |
| `types.ts`    | `../src/types.ts`         |
| `mockData.ts` | `../src/data/mockData.ts` |
| `useCart.ts`  | `../src/hooks/useCart.ts` |

They are pure TypeScript with no DOM dependency, so the native app runs them
unmodified — including `useCart`, which drives per-hub cart grouping on both
platforms.

**These are generated files. Edit the web app's copies, then run
`npm run sync:shared`.**

Why copy rather than import across directories: Metro will not resolve modules
outside the Expo project root unless the repository is laid out as a real
monorepo with workspace symlinks. Restructuring the web app into a workspace
package was more disruption than the sharing was worth, so the copy is explicit
and refreshed by script instead of drifting silently.

## Architecture

```
App.tsx                     providers + NavigationContainer
src/
  theme.ts                  brand tokens mirroring the web CSS variables
  CartContext.tsx           wraps the shared useCart hook for the navigator
  navigation/
    types.ts                typed route params
    RootNavigator.tsx       stack over a 5-tab bottom navigator
  components/
    QuantityStepper.tsx     round + that expands into a -/qty/+ pill
    ProductTile.tsx         image-dominant card, stepper over the image
    RetailerCard.tsx        hub card, rail and row variants
    SectionRail.tsx         titled horizontal scroller
  screens/
    HomeScreen, BrowseScreen, BuyAgainScreen,
    CartsScreen, AccountScreen,
    StoreDetailScreen, ProductDetailScreen
```

### Navigation

A native stack wraps the tab navigator. Tabs are Home / Browse / Buy again /
Carts / Account; store and product detail push onto the stack above them, so
they get a native back gesture and header.

Grid tiles are sized from `useWindowDimensions` rather than flex, so two columns
line up with a fixed gutter on any screen width.
