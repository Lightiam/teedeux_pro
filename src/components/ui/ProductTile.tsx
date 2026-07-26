import React from 'react';
import { Product } from '../../types';
import { QuantityStepper } from './QuantityStepper';

interface ProductTileProps {
  product: Product;
  quantity: number;
  onIncrement: (product: Product) => void;
  onDecrement: (product: Product) => void;
  onOpen?: (product: Product) => void;
  /** rail = fixed width for horizontal scrollers, grid = fills its grid cell. */
  layout?: 'rail' | 'grid';
  showStoreName?: boolean;
}

/**
 * Image-dominant product card with the stepper floating over the top-right of
 * the image, so adding to cart never requires opening the product first.
 */
export const ProductTile: React.FC<ProductTileProps> = ({
  product,
  quantity,
  onIncrement,
  onDecrement,
  onOpen,
  layout = 'grid',
  showStoreName = false,
}) => {
  const width = layout === 'rail' ? 'w-[9.5rem] shrink-0' : 'w-full';

  return (
    <div
      onClick={() => onOpen?.(product)}
      className={`${width} flex flex-col text-left group cursor-pointer`}
    >
      {/* Image plate with floating stepper */}
      <div className="relative aspect-square w-full rounded-2xl bg-white border border-stone-200/70 overflow-hidden mb-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain p-3 group-active:scale-95 transition-transform duration-200"
        />

        {product.isNewArrival && (
          <span className="absolute top-2 left-2 bg-[#3b6934] text-white font-['JetBrains_Mono'] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
            New
          </span>
        )}

        <div className="absolute bottom-2 right-2">
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => onIncrement(product)}
            onDecrement={() => onDecrement(product)}
            label={product.name}
          />
        </div>
      </div>

      {/* Price leads, the way it does on a shelf tag */}
      <div className="px-0.5">
        <div className="font-extrabold text-[15px] text-[#1c1b1b] leading-none">
          {product.currency}
          {product.price.toFixed(2)}
        </div>
        <h3 className="text-[13px] text-[#1c1b1b] leading-snug line-clamp-2 mt-1">
          {product.name}
        </h3>
        <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 mt-0.5">
          {product.weightOrUnit}
        </p>
        {showStoreName && (
          <p className="text-[10px] text-[#584238] truncate mt-0.5">{product.storeName}</p>
        )}
      </div>
    </div>
  );
};
