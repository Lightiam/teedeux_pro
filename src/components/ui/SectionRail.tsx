import React from 'react';

interface SectionRailProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
}

/**
 * Titled horizontal scroller. Bleeds to the screen edges so the last card is
 * visibly clipped — the cue that tells a shopper the row keeps going.
 */
export const SectionRail: React.FC<SectionRailProps> = ({
  title,
  subtitle,
  onSeeAll,
  children,
}) => (
  <section className="space-y-3">
    <div className="flex items-end justify-between px-4">
      <div>
        <h2 className="text-lg font-extrabold text-[#1c1b1b] leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-[#584238] mt-0.5">{subtitle}</p>}
      </div>
      {onSeeAll && (
        <button
          type="button"
          onClick={onSeeAll}
          className="text-xs font-bold text-[#9c3f00] shrink-0 pb-0.5 active:opacity-60"
        >
          See all
        </button>
      )}
    </div>

    <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1 snap-x snap-mandatory">
      {React.Children.map(children, (child) => (
        <div className="snap-start">{child}</div>
      ))}
    </div>
  </section>
);
