import React from 'react';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Compact sits on product tiles; full is used in cart rows and detail sheets. */
  size?: 'compact' | 'full';
  label?: string;
}

/**
 * Collapsed to a single round "+" until the item is in the cart, then expands
 * into a −/qty/+ pill. Keeping both states in one control means the button
 * never moves as the shopper taps it.
 */
export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'compact',
  label = 'item',
}) => {
  const stop = (e: React.MouseEvent, fn: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    fn();
  };

  const dimension = size === 'compact' ? 'h-9 w-9' : 'h-11 w-11';
  const pillHeight = size === 'compact' ? 'h-9' : 'h-11';
  const iconSize = size === 'compact' ? 'text-lg' : 'text-xl';

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={(e) => stop(e, onIncrement)}
        aria-label={`Add ${label} to cart`}
        className={`${dimension} shrink-0 rounded-full bg-white border border-stone-300 text-[#9c3f00] shadow-md flex items-center justify-center active:scale-90 hover:border-[#9c3f00] hover:bg-[#9c3f00] hover:text-white transition-all duration-150`}
      >
        <span className={`material-symbols-outlined ${iconSize}`}>add</span>
      </button>
    );
  }

  return (
    <div
      className={`${pillHeight} shrink-0 rounded-full bg-[#9c3f00] text-white shadow-md flex items-center justify-between gap-1 px-1 animate-in fade-in zoom-in-95 duration-150`}
    >
      <button
        type="button"
        onClick={(e) => stop(e, onDecrement)}
        aria-label={quantity === 1 ? `Remove ${label} from cart` : `Decrease ${label} quantity`}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
      >
        <span className="material-symbols-outlined text-base">
          {quantity === 1 ? 'delete' : 'remove'}
        </span>
      </button>

      <span className="font-bold text-sm tabular-nums min-w-[1.25rem] text-center" aria-live="polite">
        {quantity}
      </span>

      <button
        type="button"
        onClick={(e) => stop(e, onIncrement)}
        aria-label={`Increase ${label} quantity`}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
      >
        <span className="material-symbols-outlined text-base">add</span>
      </button>
    </div>
  );
};
