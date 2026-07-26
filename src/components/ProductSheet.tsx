import React from 'react';
import { Product } from '../types';
import { BottomSheet } from './ui/BottomSheet';
import { QuantityStepper } from './ui/QuantityStepper';

interface ProductSheetProps {
  product: Product | null;
  quantity: number;
  onClose: () => void;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onViewStore: (product: Product) => void;
}

/**
 * Product detail as a bottom sheet rather than a route, so dismissing it
 * returns the shopper to exactly where they were in the grid.
 */
export const ProductSheet: React.FC<ProductSheetProps> = ({
  product,
  quantity,
  onClose,
  onIncrement,
  onDecrement,
  onViewStore,
}) => {
  if (!product) return null;

  const lineTotal = product.price * Math.max(quantity, 1);

  return (
    <BottomSheet
      open={Boolean(product)}
      onClose={onClose}
      title={product.name}
      footer={
        <div className="flex items-center gap-3">
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => onIncrement(product)}
            onDecrement={() => onDecrement(product)}
            size="full"
            label={product.name}
          />
          <button
            type="button"
            onClick={() => {
              if (quantity === 0) onIncrement(product);
              onClose();
            }}
            className="flex-1 h-11 rounded-full bg-[#9c3f00] text-white font-bold text-sm active:scale-[0.98] transition-transform"
          >
            {quantity === 0
              ? `Add to cart • ${product.currency}${product.price.toFixed(2)}`
              : `Done • ${product.currency}${lineTotal.toFixed(2)}`}
          </button>
        </div>
      }
    >
      <div className="px-5 py-4 space-y-4">
        <div className="aspect-square w-full rounded-2xl bg-[#f6f3f2] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-6"
          />
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#1c1b1b]">
              {product.currency}
              {product.price.toFixed(2)}
            </span>
            <span className="font-['JetBrains_Mono'] text-xs text-stone-500">
              {product.weightOrUnit}
            </span>
          </div>
          <h2 className="text-base font-bold text-[#1c1b1b] mt-1.5 leading-snug">
            {product.name}
          </h2>
        </div>

        {product.description && (
          <p className="text-sm text-[#584238] leading-relaxed">{product.description}</p>
        )}

        <button
          type="button"
          onClick={() => onViewStore(product)}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#f6f3f2] active:scale-[0.99] transition-transform"
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[#9c3f00] text-xl shrink-0">
              storefront
            </span>
            <span className="flex flex-col items-start min-w-0">
              <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#584238]">
                Sold by
              </span>
              <span className="font-bold text-xs text-[#1c1b1b] truncate">
                {product.storeName}
              </span>
            </span>
          </span>
          <span className="material-symbols-outlined text-stone-400 shrink-0">chevron_right</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#3b6934] bg-[#b9eeab]/25 rounded-xl px-3 py-2.5">
          <span className="material-symbols-outlined text-base shrink-0">local_shipping</span>
          <span>Nationwide 2-day express delivery</span>
        </div>
      </div>
    </BottomSheet>
  );
};
