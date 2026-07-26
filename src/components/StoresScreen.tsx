import React, { useState } from 'react';
import { Aisle, Product, ProductCategory, ScreenId, Store } from '../types';
import { ProductTile } from './ui/ProductTile';
import { RetailerCard } from './ui/RetailerCard';

interface StoresScreenProps {
  stores: Store[];
  products: Product[];
  aisles: Aisle[];
  onNavigate: (screen: ScreenId) => void;
  onSelectStore: (store: Store) => void;
  onOpenProduct: (product: Product) => void;
  quantityOf: (productId: string) => number;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  selectedAisle: ProductCategory | 'all';
  onSelectAisle: (aisle: ProductCategory | 'all') => void;
}

/** Browse: the full catalog, filtered by aisle, plus a hubs tab. */
export const StoresScreen: React.FC<StoresScreenProps> = ({
  stores,
  products,
  aisles,
  onNavigate,
  onSelectStore,
  onOpenProduct,
  quantityOf,
  onIncrement,
  onDecrement,
  selectedAisle,
  onSelectAisle,
}) => {
  const [tab, setTab] = useState<'products' | 'hubs'>('products');

  const filtered =
    selectedAisle === 'all' ? products : products.filter((p) => p.category === selectedAisle);

  const handleStoreSelect = (store: Store) => {
    onSelectStore(store);
    onNavigate('store-detail');
  };

  const chips: Array<{ id: ProductCategory | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    ...aisles.map((a) => ({ id: a.id, label: a.label })),
  ];

  return (
    <div className="pb-6">
      {/* Products / Hubs toggle */}
      <div className="px-4 pt-3">
        <div className="flex rounded-full bg-[#eae7e7] p-1">
          {(['products', 'hubs'] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                tab === value ? 'bg-white text-[#9c3f00] shadow-sm' : 'text-[#584238]'
              }`}
            >
              {value === 'products' ? `Items (${products.length})` : `Hubs (${stores.length})`}
            </button>
          ))}
        </div>
      </div>

      {tab === 'products' ? (
        <>
          {/* Aisle chips */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-3 sticky top-0 bg-[#fcf9f8] z-10">
            {chips.map((chip) => {
              const isActive = selectedAisle === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onSelectAisle(chip.id)}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#9c3f00] text-white border-[#9c3f00]'
                      : 'bg-white text-[#584238] border-stone-200'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4">
              {filtered.map((product) => (
                <ProductTile
                  key={product.id}
                  product={product}
                  quantity={quantityOf(product.id)}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                  onOpen={onOpenProduct}
                  showStoreName
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <span className="material-symbols-outlined text-5xl text-stone-300">search_off</span>
              <h3 className="text-base font-bold text-[#1c1b1b] mt-2">Nothing in this aisle yet</h3>
              <p className="text-sm text-[#584238] mt-1">Try another department.</p>
              <button
                type="button"
                onClick={() => onSelectAisle('all')}
                className="mt-4 px-5 py-2.5 bg-[#9c3f00] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
              >
                Show all items
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="px-4 pt-3 space-y-2.5">
          {stores.map((store) => (
            <RetailerCard
              key={store.id}
              store={store}
              layout="row"
              onSelect={handleStoreSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
