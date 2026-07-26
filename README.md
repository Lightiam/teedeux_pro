# Teedeux Mart

Mobile grocery-delivery app for authentic African and diaspora groceries, delivered
nationwide across all 50 US states. The shopping experience follows the patterns
established by Instacart — retailer carousel, buy-it-again, aisle browsing, per-hub
carts — dressed in Teedeux's own brand.

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

## Demo navigation

A "Screen Previewer" control sits in the top-right corner and jumps directly to
any of the 16 screens. It is a development aid, not part of the shopping flow.

## Data

All catalog data is mock data in `src/data/mockData.ts` — 29 products across 4
fulfilment hubs. There is no backend yet.
