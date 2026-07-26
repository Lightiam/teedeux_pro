/**
 * Pricing rules and promo codes.
 *
 * These live on the server so the two clients cannot disagree about what an
 * order costs — and so a client cannot propose its own total.
 */
export const PRICING = {
  freeDeliveryThreshold: 35,
  deliveryFee: 3.99,
  serviceFee: 1.5,
} as const;

export const PROMO_CODES: Record<string, number> = {
  FRESH: 5,
  AFRICA10: 5,
};

/**
 * Browser origins allowed to call the API.
 *
 * Firebase Hosting rewrites arrive same-origin, so this only matters for local
 * development and for the native app talking to a deployed backend directly.
 */
export const CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:4300',
  'http://localhost:5000',
  'http://localhost:8081',
];

/** Firestore collection names, in one place so a rename can't drift. */
export const COLLECTIONS = {
  users: 'users',
  stores: 'stores',
  products: 'products',
  aisles: 'aisles',
  orders: 'orders',
  /** Cart lines live at users/{uid}/cart/{productId}. */
  cart: 'cart',
} as const;
