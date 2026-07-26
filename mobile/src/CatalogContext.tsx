import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { catalogApi } from './api/endpoints';
import type { Aisle, Product, Store } from './shared/types';
import { useAuth } from './AuthContext';

interface CatalogValue {
  stores: Store[];
  products: Product[];
  aisles: Aisle[];
  buyItAgain: Product[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

const CatalogContext = createContext<CatalogValue | null>(null);

/**
 * The whole catalog, fetched once after sign-in. It is small enough that paging
 * it per screen would cost more in round trips than it saves in payload.
 */
export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [aisles, setAisles] = useState<Aisle[]>([]);
  const [buyItAgain, setBuyItAgain] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Independent requests — fire together rather than in sequence.
    const [storesResult, aislesResult, productsResult, againResult] = await Promise.allSettled([
      catalogApi.stores(),
      catalogApi.aisles(),
      catalogApi.products({ limit: 200 }),
      isAuthenticated ? catalogApi.buyItAgain() : Promise.resolve({ products: [] }),
    ]);

    if (storesResult.status === 'fulfilled') setStores(storesResult.value.stores);
    if (aislesResult.status === 'fulfilled') setAisles(aislesResult.value.aisles);
    if (productsResult.status === 'fulfilled') setProducts(productsResult.value.products);
    if (againResult.status === 'fulfilled') setBuyItAgain(againResult.value.products);

    const failure = [storesResult, aislesResult, productsResult].find(
      (result) => result.status === 'rejected'
    );
    if (failure && failure.status === 'rejected') {
      setError(
        failure.reason instanceof Error ? failure.reason.message : 'Could not load the catalog'
      );
    }

    setIsLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<CatalogValue>(
    () => ({ stores, products, aisles, buyItAgain, isLoading, error, reload: load }),
    [stores, products, aisles, buyItAgain, isLoading, error, load]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export function useCatalog(): CatalogValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside a CatalogProvider');
  return context;
}
