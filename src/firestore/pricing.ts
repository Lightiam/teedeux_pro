import type { ApiStoreCart, ApiTotals } from '../api/types';

const FREE_DELIVERY_THRESHOLD = 35;
const DELIVERY_FEE = 3.99;
const SERVICE_FEE = 1.5;
const PROMO_CODES: Record<string, number> = { FRESH: 5, AFRICA10: 5 };

const round2 = (value: number): number => Math.round(value * 100) / 100;

/**
 * Cart totals for DISPLAY ONLY.
 *
 * This mirrors functions/src/pricing.ts so the cart screen can show a figure
 * without a round trip. It is deliberately not authoritative: checkout runs the
 * server's own calculation and charges that, so a tampered client can only
 * mislead itself. Keep the two in step — if the server's rules change, this
 * copy must follow or the preview will disagree with the receipt.
 */
export function estimateTotals(carts: ApiStoreCart[], promoCode?: string | null): ApiTotals {
  const subtotal = round2(carts.reduce((sum, cart) => sum + cart.subtotal, 0));

  const qualifiesForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryFee = subtotal <= 0 || qualifiesForFreeDelivery ? 0 : DELIVERY_FEE;
  const serviceFee = subtotal <= 0 ? 0 : SERVICE_FEE;

  const promoValue = promoCode ? (PROMO_CODES[promoCode.trim().toUpperCase()] ?? 0) : 0;
  const discount = subtotal > 0 ? Math.min(promoValue, subtotal) : 0;

  return {
    subtotal,
    deliveryFee: round2(deliveryFee),
    serviceFee: round2(serviceFee),
    discount: round2(discount),
    total: round2(Math.max(0, subtotal + deliveryFee + serviceFee - discount)),
    amountToFreeDelivery: qualifiesForFreeDelivery
      ? 0
      : round2(Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)),
  };
}

export const isKnownPromoCode = (code: string): boolean =>
  Boolean(PROMO_CODES[code.trim().toUpperCase()]);
