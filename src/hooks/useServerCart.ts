import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cartApi } from '../api/endpoints';
import type { ApiCart, ApiStoreCart, ApiTotals } from '../api/types';
import type { Product } from '../types';

const EMPTY_TOTALS: ApiTotals = {
  subtotal: 0,
  deliveryFee: 0,
  serviceFee: 0,
  discount: 0,
  total: 0,
  amountToFreeDelivery: 0,
};

const EMPTY_CART: ApiCart = {
  carts: [],
  itemCount: 0,
  totals: EMPTY_TOTALS,
  promoCode: null,
  promoValid: null,
};

export interface ServerCart {
  storeCarts: ApiStoreCart[];
  totals: ApiTotals;
  totalCount: number;
  promoCode: string | null;
  promoValid: boolean | null;
  isLoading: boolean;
  error: string | null;
  quantityOf: (productId: string) => number;
  addItem: (product: Product) => void;
  decrementItem: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearStore: (storeId: string) => void;
  applyPromo: (code: string) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Cart state backed by the API.
 *
 * Mutations update local state immediately and reconcile with the server's
 * response, so tapping a stepper never waits on a round trip. Requests are
 * serialised through a queue because the endpoints are relative ("add one") —
 * letting two fly in parallel would race and lose an increment.
 */
export function useServerCart(enabled: boolean): ServerCart {
  const [cart, setCart] = useState<ApiCart>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  /** Tail of the in-flight mutation chain. */
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const run = useCallback((operation: () => Promise<ApiCart>) => {
    queue.current = queue.current
      .then(operation)
      .then((next) => {
        setCart(next);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Cart update failed');
      });
    return queue.current;
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCart(EMPTY_CART);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      setCart(await cartApi.get());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your cart');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Flat product-id → quantity map, rebuilt only when the cart changes. */
  const quantities = useMemo(() => {
    const map = new Map<string, number>();
    for (const storeCart of cart.carts) {
      for (const item of storeCart.items) {
        map.set(item.product.id, item.quantity);
      }
    }
    return map;
  }, [cart]);

  const quantityOf = useCallback(
    (productId: string) => quantities.get(productId) ?? 0,
    [quantities]
  );

  /** Applies a quantity change locally so the UI responds on the same frame. */
  const patchLocally = useCallback((productId: string, nextQuantity: number) => {
    setCart((current) => {
      const carts = current.carts
        .map((storeCart) => {
          const items = storeCart.items
            .map((item) =>
              item.product.id === productId ? { ...item, quantity: nextQuantity } : item
            )
            .filter((item) => item.quantity > 0);

          return {
            ...storeCart,
            items,
            itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
            subtotal:
              Math.round(items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) * 100) /
              100,
          };
        })
        .filter((storeCart) => storeCart.items.length > 0);

      return {
        ...current,
        carts,
        itemCount: carts.reduce((sum, c) => sum + c.itemCount, 0),
      };
    });
  }, []);

  const addItem = useCallback(
    (product: Product) => {
      const current = quantities.get(product.id) ?? 0;
      // A product not yet in the cart has no row to patch, so skip straight to
      // the server rather than fabricating one from partial data.
      if (current > 0) patchLocally(product.id, current + 1);
      void run(() => cartApi.addItem(product.id, 1));
    },
    [quantities, patchLocally, run]
  );

  const decrementItem = useCallback(
    (product: Product) => {
      const current = quantities.get(product.id) ?? 0;
      if (current === 0) return;

      const next = current - 1;
      patchLocally(product.id, next);
      void run(() => cartApi.setQuantity(product.id, next));
    },
    [quantities, patchLocally, run]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      patchLocally(productId, Math.max(0, quantity));
      void run(() => cartApi.setQuantity(productId, Math.max(0, quantity)));
    },
    [patchLocally, run]
  );

  const clearStore = useCallback(
    (storeId: string) => {
      setCart((current) => {
        const carts = current.carts.filter((c) => c.store.id !== storeId);
        return {
          ...current,
          carts,
          itemCount: carts.reduce((sum, c) => sum + c.itemCount, 0),
        };
      });
      void run(() => cartApi.clearStore(storeId));
    },
    [run]
  );

  const applyPromo = useCallback(
    async (code: string) => {
      await run(() => cartApi.get(code));
    },
    [run]
  );

  return {
    storeCarts: cart.carts,
    totals: cart.totals,
    totalCount: cart.itemCount,
    promoCode: cart.promoCode,
    promoValid: cart.promoValid,
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
