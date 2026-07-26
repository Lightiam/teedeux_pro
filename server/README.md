# Teedeux Mart — API

Express + TypeScript backend for Teedeux Mart. Serves the catalog, carts,
checkout, order tracking and profiles consumed by the web app and the native
app in `mobile/`.

## Getting started

```bash
npm install
npm run seed     # create the schema and load the catalog
npm run dev      # tsx watch on http://localhost:4000
```

```bash
npm test         # end-to-end checks against a running server
```

Copy `.env.example` to `.env` to change anything. Defaults work out of the box.

The seed creates a demo account:

```
marcus.vance@example.com / teedeux1234
```

## Stack

- **Express 5** — routing
- **SQLite** via Node's built-in `node:sqlite` — no native compilation, no
  external database process
- **JWT** bearer tokens, **bcrypt** password hashing
- **zod** request validation

## Endpoints

Everything is under `/api`. Authenticated routes take `Authorization: Bearer <token>`.

### Auth

| Method | Path                   | Auth | Purpose                          |
| ------ | ---------------------- | ---- | -------------------------------- |
| POST   | `/auth/signup`         | —    | Create an account, returns token |
| POST   | `/auth/login`          | —    | Exchange credentials for a token |
| POST   | `/auth/reset-password` | —    | Set a new password               |
| GET    | `/auth/me`             | ✓    | Current user                     |

### Catalog

| Method | Path                     | Auth     | Purpose                            |
| ------ | ------------------------ | -------- | ---------------------------------- |
| GET    | `/catalog/stores`        | —        | All fulfilment hubs                |
| GET    | `/catalog/stores/:id`    | —        | One hub plus its products          |
| GET    | `/catalog/aisles`        | —        | Aisle taxonomy                     |
| GET    | `/catalog/products`      | —        | Filter by `storeId`, `category`, `search`; paged via `limit`/`offset` |
| GET    | `/catalog/products/:id`  | —        | One product                        |
| GET    | `/catalog/buy-it-again`  | optional | Past purchases; `[]` when anonymous |

### Cart

| Method | Path                    | Auth | Purpose                             |
| ------ | ----------------------- | ---- | ----------------------------------- |
| GET    | `/cart`                 | ✓    | Carts grouped by hub, plus totals   |
| POST   | `/cart/items`           | ✓    | Add to the existing quantity        |
| PATCH  | `/cart/items/:productId`| ✓    | Set an absolute quantity; `0` removes |
| DELETE | `/cart/items/:productId`| ✓    | Remove a line                       |
| DELETE | `/cart/stores/:storeId` | ✓    | Empty one hub's cart                |
| DELETE | `/cart`                 | ✓    | Empty everything                    |

`GET /cart?promoCode=FRESH` previews a discount without storing it.

### Orders

| Method | Path                  | Auth | Purpose                                |
| ------ | --------------------- | ---- | -------------------------------------- |
| POST   | `/orders/checkout`    | ✓    | Turn carts into orders, one per hub     |
| GET    | `/orders`             | ✓    | Order history                           |
| GET    | `/orders/:id`         | ✓    | One order                               |
| POST   | `/orders/:id/status`  | ✓    | Advance tracking status                 |

### Profile

| Method | Path                    | Auth | Purpose                    |
| ------ | ----------------------- | ---- | -------------------------- |
| GET    | `/profile`              | ✓    | Current user               |
| PATCH  | `/profile`              | ✓    | Update name/phone/address  |
| POST   | `/profile/wallet/top-up`| ✓    | Credit the wallet          |

## Design notes

**Pricing is server-side.** `src/pricing.ts` is the only place order maths
happens, so a client cannot propose a total. Free delivery over $35, a $1.50
service fee, and promo codes all resolve there.

**One order per hub.** Hubs ship independently, so checkout splits the cart and
prices each shipment on its own subtotal. Item prices are copied onto the order
at checkout — later catalog edits never rewrite order history.

**Order status only moves forward.** `placed → shopping → packed → in_transit →
delivered`, with cancellation allowed from any non-final state. Backwards
transitions are rejected with a 409.

**Ownership is enforced by query, not by check.** Order reads and writes are
scoped by `user_id` in the SQL itself, so another user's order is simply not
found rather than found-and-refused.

## Known gaps

- **Password reset is development-grade.** It sets a new password directly.
  A real flow needs an emailed, signed, single-use, expiring token.
- **Wallet top-up credits the balance directly** — no payment provider.
- **No rate limiting** on auth endpoints.
- **Order status is client-driven**, standing in for courier and warehouse
  systems.
