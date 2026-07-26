import { useCallback, useEffect, useState } from 'react';
import { catalogApi } from '../api/endpoints';
import type { Aisle, Product, Store } from '../types';

interface AsyncState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
}

const message = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

/**
 * Stores, aisles and the full product list — the data every screen needs.
 * Fetched once on mount; the catalog is small enough that paging it per screen
 * would cost more in round trips than it saves in payload.
 */
export function useCatalog() {
  const [stores, setStores] = useState<AsyncState<Store[]>>({
    data: [],
    isLoading: true,
    error: null,
  });
  const [aisles, setAisles] = useState<AsyncState<Aisle[]>>({
    data: [],
    isLoading: true,
    error: null,
  });
  const [products, setProducts] = useState<AsyncState<Product[]>>({
    data: [],
    isLoading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setStores((s) => ({ ...s, isLoading: true }));
    setAisles((s) => ({ ...s, isLoading: true }));
    setProducts((s) => ({ ...s, isLoading: true }));

    // Independent requests — fire together rather than in sequence.
    const [storesResult, aislesResult, productsResult] = await Promise.allSettled([
      catalogApi.stores(),
      catalogApi.aisles(),
      catalogApi.products({ limit: 200 }),
    ]);

    setStores(
      storesResult.status === 'fulfilled'
        ? { data: storesResult.value.stores, isLoading: false, error: null }
        : { data: [], isLoading: false, error: message(storesResult.reason, 'Could not load hubs') }
    );

    setAisles(
      aislesResult.status === 'fulfilled'
        ? { data: aislesResult.value.aisles, isLoading: false, error: null }
        : {
            data: [],
            isLoading: false,
            error: message(aislesResult.reason, 'Could not load aisles'),
          }
    );

    setProducts(
      productsResult.status === 'fulfilled'
        ? { data: productsResult.value.products, isLoading: false, error: null }
        : {
            data: [],
            isLoading: false,
            error: message(productsResult.reason, 'Could not load products'),
          }
    );
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    stores: stores.data,
    aisles: aisles.data,
    products: products.data,
    isLoading: stores.isLoading || aisles.isLoading || products.isLoading,
    error: stores.error ?? aisles.error ?? products.error,
    reload: load,
  };
}

/** Past purchases for the buy-it-again rail. Empty when signed out. */
export function useBuyItAgain(enabled: boolean) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    catalogApi
      .buyItAgain()
      .then((result) => {
        if (!cancelled) setProducts(result.products);
      })
      .catch(() => {
        // A missing rail is a lesser failure than a broken home screen.
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { products, isLoading };
}
