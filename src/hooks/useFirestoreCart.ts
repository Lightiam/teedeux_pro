import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { firestoreCart, groupCart } from '../firestore/cart';
import { estimateTotals, isKnownPromoCode } from '../firestore/pricing';
import type { ServerCart } from './useServerCart';
import type { Product, Store } from '../types';

/**
 * Cart backed directly by Firestore, for deployments with no Cloud Functions.
 *
 * The published rules let a shopper write only their own cart, and only a
 * quantity — never a price — so nothing here is trusted with money. Totals are
 * estimated on the client for display; checkout recomputes them server-side and
 * charges that, so this can only ever mislead the shopper about their own cart.
 *
 * Writes are queued rather than fired in parallel: two taps on the same stepper
 * would otherwise race, and the later write could carry the earlier quantity.
 */
export function useFirestoreCart(
  uid: string | null,
  products: Product[],
  stores: Store[]
): ServerCart {
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
  const [isLoading, setIsLoading] = useState(Boolean(uid));
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);

  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const run = useCallback((operation: () => Promise<void>) => {
    queue.current = queue.current.then(operation).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Cart update failed');
    });
    return queue.current;
  }, []);

  const refresh = useCallback(async () => {
    if (!uid) {
      setQuantities(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      setQuantities(await firestoreCart.quantities(uid));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your cart');
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const storeCarts = useMemo(
    () => groupCart(quantities, products, stores),
    [quantities, products, stores]
  );

  const totals = useMemo(() => estimateTotals(storeCarts, promoCode), [storeCarts, promoCode]);

  const quantityOf = useCallback(
    (productId: string) => quantities.get(productId) ?? 0,
    [quantities]
  );

  /** Applies locally first so a stepper tap lands on the same frame. */
  const write = useCallback(
    (productId: string, nextQuantity: number) => {
      if (!uid) return;

      setQuantities((current) => {
        const next = new Map(current);
        if (nextQuantity <= 0) next.delete(productId);
        else next.set(productId, nextQuantity);
        return next;
      });

      void run(() => firestoreCart.setQuantity(uid, productId, nextQuantity));
    },
    [uid, run]
  );

  const addItem = useCallback(
    (product: Product) => write(product.id, (quantities.get(product.id) ?? 0) + 1),
    [quantities, write]
  );

  const decrementItem = useCallback(
    (product: Product) => {
      const current = quantities.get(product.id) ?? 0;
      if (current > 0) write(product.id, current - 1);
    },
    [quantities, write]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => write(productId, Math.max(0, quantity)),
    [write]
  );

  const clearStore = useCallback(
    (storeId: string) => {
      if (!uid) return;

      const doomed = products
        .filter((product) => product.storeId === storeId)
        .map((product) => product.id)
        .filter((productId) => quantities.has(productId));

      setQuantities((current) => {
        const next = new Map(current);
        for (const productId of doomed) next.delete(productId);
        return next;
      });

      void run(() => firestoreCart.clearStore(uid, doomed));
    },
    [uid, products, quantities, run]
  );

  const applyPromo = useCallback(async (code: string) => {
    setPromoCode(code.trim() ? code.trim().toUpperCase() : null);
  }, []);

  return {
    storeCarts,
    totals,
    totalCount: Array.from(quantities.values()).reduce((sum, quantity) => sum + quantity, 0),
    promoCode,
    promoValid: promoCode ? isKnownPromoCode(promoCode) : null,
    isLoading,
    error,
    quantityOf,
    addItem,
    decrementItem,
    setQuantity,
    clearStore,
    applyPromo,
    refresh,
  };
}
