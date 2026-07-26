import React from 'react';
import { Store } from '../../types';

interface RetailerCardProps {
  store: Store;
  onSelect: (store: Store) => void;
  layout?: 'rail' | 'row';
}

/** Pulls the leading number out of "$2.99 Delivery" / "Free Delivery" for the badge. */
const shortFee = (fee: string): string => {
  if (/free/i.test(fee)) return 'Free delivery';
  const match = fee.match(/\$[\d.]+/);
  return match ? `${match[0]} delivery` : fee;
};

/** Takes "30-45 min (Houston) / 2-Day US Air" down to "30-45 min". */
const shortEta = (eta: string): string => {
  const match = eta.match(/[\d]+-[\d]+\s*min/i);
  return match ? match[0] : eta.split('/')[0].trim();
};

/**
 * Retailer card for the home carousel — logo, ETA and delivery cost, which is
 * the whole decision set a shopper needs when picking where to shop.
 */
export const RetailerCard: React.FC<RetailerCardProps> = ({
  store,
  onSelect,
  layout = 'rail',
}) => {
  if (layout === 'row') {
    return (
      <button
        type="button"
        onClick={() => onSelect(store)}
        className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/70 active:scale-[0.99] transition-transform text-left"
      >
        <img
          src={store.imageUrl}
          alt=""
          className="h-14 w-14 rounded-xl object-cover bg-stone-100 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-[#1c1b1b] truncate">{store.name}</h3>
            {store.isFeatured && (
              <span className="material-symbols-outlined text-[#3b6934] text-sm fill-1 shrink-0">
                verified
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#584238] truncate mt-0.5">{store.tagline}</p>
          <div className="flex items-center gap-2 mt-1 font-['JetBrains_Mono'] text-[10px] text-stone-600">
            <span className="font-bold text-[#1c1b1b]">{shortEta(store.deliveryTime)}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-stone-400" />
            <span>{shortFee(store.deliveryFee)}</span>
            <span className="h-0.5 w-0.5 rounded-full bg-stone-400" />
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px] fill-1 text-[#3b6934]">
                star
              </span>
              {store.rating}
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-stone-400 shrink-0">chevron_right</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(store)}
      className="w-[10.5rem] shrink-0 text-left active:scale-[0.97] transition-transform"
    >
      <div className="relative h-24 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/70">
        <img src={store.imageUrl} alt="" className="h-full w-full object-cover" />
        {store.isFeatured && (
          <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-[#3b6934] font-['JetBrains_Mono'] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px] fill-1">verified</span>
            Verified
          </span>
        )}
      </div>

      <h3 className="font-bold text-[13px] text-[#1c1b1b] mt-2 truncate">{store.name}</h3>
      <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-[10px] text-stone-600 mt-0.5">
        <span className="font-bold text-[#1c1b1b]">{shortEta(store.deliveryTime)}</span>
        <span className="h-0.5 w-0.5 rounded-full bg-stone-400" />
        <span className="truncate">{shortFee(store.deliveryFee)}</span>
      </div>
    </button>
  );
};
