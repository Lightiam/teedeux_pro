import { useCallback, useMemo, useState } from 'react';
import { CartItem, Product, Store, StoreCart } from '../types';

/**
 * Cart state for the whole app. Items are held in one flat list and grouped by
 * store on read, which keeps add/remove simple while still letting the UI
 * present one cart per fulfilment hub the way a shopper expects.
 */
export function useCart(initialItems: CartItem[] = [], stores: Store[] = []) {
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
    },
    [removeItem]
  );

  const decrementItem = useCallback(
    (product: Product) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (!existing) return prev;
        if (existing.quantity <= 1) {
          return prev.filter((item) => item.product.id !== product.id);
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        );
      });
    },
    []
  );

  const clearStore = useCallback((storeId: string) => {
    setItems((prev) => prev.filter((item) => item.product.storeId !== storeId));
  }, []);

  /** Quantity of a single product, 0 when absent — drives every stepper. */
  const quantityOf = useCallback(
    (productId: string) => items.find((item) => item.product.id === productId)?.quantity ?? 0,
    [items]
  );

  const storeCarts: StoreCart[] = useMemo(() => {
    const byStore = new Map<string, CartItem[]>();

    for (const item of items) {
      const list = byStore.get(item.product.storeId);
      if (list) {
        list.push(item);
      } else {
        byStore.set(item.product.storeId, [item]);
      }
    }

    return Array.from(byStore.entries()).map(([storeId, storeItems]) => {
      const store =
        stores.find((s) => s.id === storeId) ??
        // Fall back to a minimal store built from the product's own metadata so
        // a cart never disappears just because its store is missing from the list.
        ({
          id: storeId,
          name: storeItems[0].product.storeName,
          rating: 0,
          deliveryTime: '',
          deliveryFee: '',
          minOrder: '',
          tagline: '',
          imageUrl: storeItems[0].product.imageUrl,
          categoryTags: [],
        } as Store);

      return {
        store,
        items: storeItems,
        subtotal: storeItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
        itemCount: storeItems.reduce((sum, i) => sum + i.quantity, 0),
      };
    });
  }, [items, stores]);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  return {
    items,
    storeCarts,
    totalCount,
    subtotal,
    addItem,
    removeItem,
    setQuantity,
    decrementItem,
    clearStore,
    quantityOf,
  };
}
