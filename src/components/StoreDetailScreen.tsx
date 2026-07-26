import React, { useMemo, useState } from 'react';
import { Product, ProductCategory, ScreenId, Store } from '../types';
import { mockAisles, mockProducts } from '../data/mockData';
import { ProductTile } from './ui/ProductTile';

interface StoreDetailScreenProps {
  store: Store;
  onNavigate: (screen: ScreenId) => void;
  onOpenProduct: (product: Product) => void;
  quantityOf: (productId: string) => number;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
}

export const StoreDetailScreen: React.FC<StoreDetailScreenProps> = ({
  store,
  onNavigate,
  onOpenProduct,
  quantityOf,
  onIncrement,
  onDecrement,
}) => {
  const [aisle, setAisle] = useState<ProductCategory | 'all'>('all');

  const storeProducts = useMemo(
    () => mockProducts.filter((p) => p.storeId === store.id),
    [store.id]
  );

  /** Only show aisles this hub actually stocks — empty tabs are dead ends. */
  const availableAisles = useMemo(() => {
    const stocked = new Set(storeProducts.map((p) => p.category));
    return mockAisles.filter((a) => stocked.has(a.id));
  }, [storeProducts]);

  const visible =
    aisle === 'all' ? storeProducts : storeProducts.filter((p) => p.category === aisle);

  return (
    <div className="pb-6">
      {/* Hub hero */}
      <div className="relative h-40 bg-stone-200">
        <img src={store.imageUrl} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          {/* The sticky header carries the page's h1, so this is presentational. */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-white truncate">{store.name}</span>
            {store.isFeatured && (
              <span className="material-symbols-outlined text-white text-lg fill-1 shrink-0">
                verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 font-['JetBrains_Mono'] text-[10px] text-white/90">
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px] fill-1">star</span>
              {store.rating}
            </span>
            <span className="h-0.5 w-0.5 rounded-full bg-white/60" />
            <span>{store.deliveryFee}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-white/60" />
            <span>{store.minOrder}</span>
          </div>
        </div>
      </div>

      <p className="px-4 py-3 text-xs text-[#584238] leading-relaxed">{store.tagline}</p>

      {/* Aisle tabs */}
      {availableAisles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-2 sticky top-0 bg-[#fcf9f8] z-10 border-b border-stone-200/60">
          <button
            type="button"
            onClick={() => setAisle('all')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${
              aisle === 'all'
                ? 'bg-[#9c3f00] text-white border-[#9c3f00]'
                : 'bg-white text-[#584238] border-stone-200'
            }`}
          >
            All ({storeProducts.length})
          </button>
          {availableAisles.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAisle(a.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${
                aisle === a.id
                  ? 'bg-[#9c3f00] text-white border-[#9c3f00]'
                  : 'bg-white text-[#584238] border-stone-200'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-4">
          {visible.map((product) => (
            <ProductTile
              key={product.id}
              product={product}
              quantity={quantityOf(product.id)}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onOpen={onOpenProduct}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6">
          <span className="material-symbols-outlined text-5xl text-stone-300">storefront</span>
          <h3 className="text-base font-bold text-[#1c1b1b] mt-2">
            This hub has no items listed yet
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('stores')}
            className="mt-4 px-5 py-2.5 bg-[#9c3f00] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
          >
            Browse all hubs
          </button>
        </div>
      )}
    </div>
  );
};
