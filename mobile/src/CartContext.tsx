import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { cartApi } from './api/endpoints';
import type { ApiCart, ApiStoreCart, ApiTotals } from './api/types';
import type { Product } from './shared/types';
import { useAuth } from './AuthContext';

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

interface CartApiValue {
  storeCarts: ApiStoreCart[];
  totals: ApiTotals;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  quantityOf: (productId: string) => number;
  addItem: (product: Product) => void;
  decrementItem: (product: Product) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearStore: (storeId: string) => void;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartApiValue | null>(null);

/**
 * Cart state backed by the API.
 *
 * Mutations apply locally first so a stepper tap responds immediately, then
 * reconcile with the server's response. Requests are serialised through a queue
 * because the add endpoint is relative ("add one") — two in flight at once
 * would race and lose an increment.
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<ApiCart>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
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
  }, [isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const quantities = useMemo(() => {
    const map = new Map<string, number>();
    for (const storeCart of cart.carts) {
      for (const item of storeCart.items) map.set(item.product.id, item.quantity);
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

      return { ...current, carts, itemCount: carts.reduce((sum, c) => sum + c.itemCount, 0) };
    });
  }, []);

  const addItem = useCallback(
    (product: Product) => {
      const current = quantities.get(product.id) ?? 0;
      // A product not yet in the cart has no row to patch, so go to the server.
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
      const next = Math.max(0, quantity);
      patchLocally(productId, next);
      void run(() => cartApi.setQuantity(productId, next));
    },
    [patchLocally, run]
  );

  const clearStore = useCallback(
    (storeId: string) => {
      setCart((current) => {
        const carts = current.carts.filter((c) => c.store.id !== storeId);
        return { ...current, carts, itemCount: carts.reduce((sum, c) => sum + c.itemCount, 0) };
      });
      void run(() => cartApi.clearStore(storeId));
    },
    [run]
  );

  const value = useMemo<CartApiValue>(
    () => ({
      storeCarts: cart.carts,
      totals: cart.totals,
      totalCount: cart.itemCount,
      isLoading,
      error,
      quantityOf,
      addItem,
      decrementItem,
      setQuantity,
      clearStore,
      refresh,
    }),
    [cart, isLoading, error, quantityOf, addItem, decrementItem, setQuantity, clearStore, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCartContext(): CartApiValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used inside a CartProvider');
  return context;
}
