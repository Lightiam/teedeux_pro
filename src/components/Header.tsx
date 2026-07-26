import React, { useEffect, useRef, useState } from 'react';
import { Product, ScreenId, Store } from '../types';
import { mockProducts, mockStores } from '../data/mockData';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  address?: string;
  showBack?: boolean;
  onBack?: () => void;
  titleOverride?: string;
  onAddToCart?: (product: Product) => void;
  onSelectStore?: (store: Store) => void;
}

/** Screens that render their own chrome edge-to-edge. */
const HIDDEN_ON: ScreenId[] = ['splash', 'onboarding-discover', 'onboarding-schedule'];

/** Screens that get a plain title bar rather than the address + search stack. */
const TITLE_ONLY: Record<string, string> = {
  cart: 'Your carts',
  'order-tracking': 'Order tracking',
  transactions: 'Orders',
  profile: 'Account',
  payment: 'Payment methods',
  'buy-it-again': 'Buy it again',
  login: 'Sign in',
  signup: 'Create account',
  'reset-password': 'Reset password',
  location: 'Delivery address',
};

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  address = '1234 Westheimer Rd, Houston, TX',
  showBack,
  onBack,
  titleOverride,
  onAddToCart,
  onSelectStore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (HIDDEN_ON.includes(currentScreen)) return null;

  const title = titleOverride ?? TITLE_ONLY[currentScreen];
  const isSearchScreen = currentScreen === 'home' || currentScreen === 'stores';

  const query = searchQuery.trim().toLowerCase();
  const matchedProducts = query
    ? mockProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.storeName.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            (p.description ?? '').toLowerCase().includes(query)
        )
        .slice(0, 8)
    : [];

  const matchedStores = query
    ? mockStores.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.tagline.toLowerCase().includes(query) ||
          s.categoryTags.some((t) => t.toLowerCase().includes(query))
      )
    : [];

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
    setAddedNotice(product.name);
    setTimeout(() => setAddedNotice(null), 1800);
  };

  const openStore = (store: Store) => {
    onSelectStore?.(store);
    setIsSearchFocused(false);
    setSearchQuery('');
    onNavigate('store-detail');
  };

  const openProductStore = (product: Product) => {
    const store = mockStores.find((s) => s.id === product.storeId) ?? mockStores[0];
    openStore(store);
  };

  // Plain title bar for the utility screens.
  if (title && !isSearchScreen) {
    return (
      <header
        className="sticky top-0 z-40 bg-[#fcf9f8]/95 backdrop-blur-md border-b border-stone-200/70"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 flex items-center gap-2 px-3">
          {showBack && (
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onNavigate('home'))}
              aria-label="Go back"
              className="h-9 w-9 rounded-full bg-stone-100 text-[#9c3f00] flex items-center justify-center active:scale-90 transition-transform shrink-0"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
          )}
          <h1 className="font-extrabold text-lg text-[#1c1b1b] truncate">{title}</h1>
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-40 bg-[#fcf9f8]/95 backdrop-blur-md border-b border-stone-200/70"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Row 1: delivery address — the single most consequential setting on a grocery app */}
      <div className="flex items-center justify-between gap-2 px-3 pt-2.5">
        <button
          type="button"
          onClick={() => onNavigate('location')}
          className="flex items-center gap-1.5 min-w-0 active:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-[#9c3f00] fill-1 text-xl shrink-0">
            location_on
          </span>
          <span className="flex flex-col items-start min-w-0">
            <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#584238] leading-none">
              Deliver to
            </span>
            <span className="font-bold text-xs text-[#1c1b1b] truncate max-w-[13rem] leading-tight mt-0.5">
              {address}
            </span>
          </span>
          <span className="material-symbols-outlined text-[#584238] text-base shrink-0">
            expand_more
          </span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('transactions')}
          aria-label="Orders and notifications"
          className="h-9 w-9 rounded-full text-[#9c3f00] flex items-center justify-center active:scale-90 transition-transform relative shrink-0"
        >
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#9E2A2B] rounded-full" />
        </button>
      </div>

      {/* Row 2: search */}
      <div className="px-3 pb-2.5 pt-2 relative" ref={searchRef}>
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3 text-stone-400 text-xl pointer-events-none">
            search
          </span>
          <input
            id="global-product-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search African groceries"
            className="w-full h-11 pl-11 pr-10 bg-white text-sm text-[#1c1b1b] rounded-full border border-stone-200 focus:border-[#9c3f00] focus:ring-2 focus:ring-[#9c3f00]/15 outline-none transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 h-6 w-6 rounded-full bg-stone-200 text-stone-600 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {addedNotice && (
          <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-[#3b6934] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span className="truncate">Added to cart</span>
          </div>
        )}

        {/* Live results */}
        {isSearchFocused && query.length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white rounded-2xl shadow-2xl border border-stone-200 max-h-[65vh] overflow-y-auto overscroll-contain">
            {matchedStores.length > 0 && (
              <div className="p-2">
                <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#3b6934] uppercase tracking-wider px-2 py-1.5">
                  Hubs
                </p>
                {matchedStores.map((store) => (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => openStore(store)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 active:bg-stone-100 text-left"
                  >
                    <img
                      src={store.imageUrl}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover bg-stone-100 shrink-0"
                    />
                    <span className="font-bold text-xs text-[#1c1b1b] truncate">{store.name}</span>
                    <span className="material-symbols-outlined text-stone-400 text-base ml-auto shrink-0">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="p-2 border-t border-stone-100 first:border-t-0">
              <p className="font-['JetBrains_Mono'] text-[10px] font-bold text-[#9c3f00] uppercase tracking-wider px-2 py-1.5">
                Products ({matchedProducts.length})
              </p>

              {matchedProducts.length > 0 ? (
                matchedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => openProductStore(product)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 active:bg-stone-100 cursor-pointer"
                  >
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-lg object-contain bg-stone-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-[#1c1b1b] truncate">{product.name}</p>
                      <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 truncate">
                        {product.weightOrUnit} • {product.storeName}
                      </p>
                    </div>
                    <span className="font-extrabold text-xs text-[#9c3f00] shrink-0">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleAdd(product, e)}
                      aria-label={`Add ${product.name} to cart`}
                      className="h-8 w-8 rounded-full bg-[#9c3f00] text-white flex items-center justify-center active:scale-90 transition-transform shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 py-4 text-center">
                  Nothing matched "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
