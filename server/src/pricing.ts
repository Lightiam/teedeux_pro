import { config } from './config.ts';
import { round2 } from './repository.ts';

export interface Totals {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  /** How much more the shopper must spend to earn free delivery, 0 once met. */
  amountToFreeDelivery: number;
}

/**
 * The single source of truth for what an order costs. Both the cart preview and
 * checkout call this, so a client can never talk the server into a price it did
 * not calculate.
 */
export function priceOrder(subtotal: number, promoCode?: string | null): Totals {
  const { freeDeliveryThreshold, deliveryFee, serviceFee } = config.pricing;

  const qualifiesForFreeDelivery = subtotal >= freeDeliveryThreshold;
  const delivery = subtotal <= 0 || qualifiesForFreeDelivery ? 0 : deliveryFee;
  const service = subtotal <= 0 ? 0 : serviceFee;

  const discount = resolveDiscount(subtotal, promoCode);

  return {
    subtotal: round2(subtotal),
    deliveryFee: round2(delivery),
    serviceFee: round2(service),
    discount: round2(discount),
    // Clamped so a generous promo code can never produce a negative charge.
    total: round2(Math.max(0, subtotal + delivery + service - discount)),
    amountToFreeDelivery: qualifiesForFreeDelivery
      ? 0
      : round2(Math.max(0, freeDeliveryThreshold - subtotal)),
  };
}

/** Unknown codes are worth nothing; validation of the code itself is separate. */
function resolveDiscount(subtotal: number, promoCode?: string | null): number {
  if (!promoCode || subtotal <= 0) return 0;
  const value = config.promoCodes[promoCode.trim().toUpperCase()];
  if (!value) return 0;

  // Never discount more than the goods are worth.
  return Math.min(value, subtotal);
}

export function isValidPromoCode(promoCode: string): boolean {
  return Boolean(config.promoCodes[promoCode.trim().toUpperCase()]);
}
