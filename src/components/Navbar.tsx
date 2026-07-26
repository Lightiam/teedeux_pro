import React from 'react';
import { ScreenId } from '../types';

interface NavbarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  cartCount: number;
}

interface Tab {
  id: string;
  label: string;
  icon: string;
  target: ScreenId;
  /** Screens that should light this tab up. */
  matches: ScreenId[];
  badge?: number;
}

/** Full-screen flows own the whole viewport, so the tab bar steps aside. */
const HIDDEN_ON: ScreenId[] = [
  'splash',
  'onboarding-discover',
  'onboarding-schedule',
  'login',
  'signup',
  'reset-password',
  'location',
];

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate, cartCount }) => {
  if (HIDDEN_ON.includes(currentScreen)) return null;

  const tabs: Tab[] = [
    { id: 'home', label: 'Home', icon: 'home', target: 'home', matches: ['home'] },
    {
      id: 'browse',
      label: 'Browse',
      icon: 'search',
      target: 'stores',
      matches: ['stores', 'store-detail'],
    },
    {
      id: 'again',
      label: 'Buy again',
      icon: 'replay',
      target: 'buy-it-again',
      matches: ['buy-it-again'],
    },
    {
      id: 'carts',
      label: 'Carts',
      icon: 'shopping_cart',
      target: 'cart',
      matches: ['cart'],
      badge: cartCount,
    },
    {
      id: 'account',
      label: 'Account',
      icon: 'person',
      target: 'profile',
      matches: ['profile', 'payment', 'order-tracking', 'transactions'],
    },
  ];

  return (
    <nav
      className="sticky bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
        {tabs.map((tab) => {
          const isActive = tab.matches.includes(currentScreen);
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}-btn`}
              type="button"
              onClick={() => onNavigate(tab.target)}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 active:scale-95 transition-transform"
            >
              <span className="relative">
                <span
                  className={`material-symbols-outlined text-[26px] leading-none transition-colors ${
                    isActive ? 'fill-1 text-[#9c3f00]' : 'text-[#584238]'
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.badge != null && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[1.05rem] h-[1.05rem] px-1 bg-[#9E2A2B] text-white text-[10px] font-bold flex items-center justify-center rounded-full tabular-nums">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] leading-none truncate max-w-full transition-colors ${
                  isActive ? 'font-bold text-[#9c3f00]' : 'font-medium text-[#584238]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
