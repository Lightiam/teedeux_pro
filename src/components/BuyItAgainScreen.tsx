import React from 'react';
import { Product, ScreenId } from '../types';
import { ProductTile } from './ui/ProductTile';

interface BuyItAgainScreenProps {
  products: Product[];
  isLoading: boolean;
  onNavigate: (screen: ScreenId) => void;
  onOpenProduct: (product: Product) => void;
  quantityOf: (productId: string) => number;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
}

export const BuyItAgainScreen: React.FC<BuyItAgainScreenProps> = ({
  products,
  isLoading,
  onNavigate,
  onOpenProduct,
  quantityOf,
  onIncrement,
  onDecrement,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4 pt-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square w-full rounded-2xl bg-stone-200/70 mb-2" />
            <div className="h-3.5 w-1/3 rounded bg-stone-200/70" />
            <div className="h-3 w-full rounded bg-stone-200/70 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <span className="material-symbols-outlined text-5xl text-stone-300">replay</span>
        <h3 className="text-base font-bold text-[#1c1b1b] mt-2">No past orders yet</h3>
        <p className="text-sm text-[#584238] mt-1">
          Items you order will show up here for one-tap reordering.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('stores')}
          className="mt-4 px-5 py-2.5 bg-[#9c3f00] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
        >
          Start shopping
        </button>
      </div>
    );
  }

  const addAll = () => products.forEach((product) => onIncrement(product));

  return (
    <div className="pb-6">
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-xs text-[#584238]">
          {products.length} items from your order history
        </p>
        <button
          type="button"
          onClick={addAll}
          className="px-3.5 py-2 rounded-full bg-[#9c3f00] text-white text-xs font-bold active:scale-95 transition-transform shrink-0"
        >
          Add all to cart
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-5 px-4">
        {products.map((product) => (
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
    </div>
  );
};
