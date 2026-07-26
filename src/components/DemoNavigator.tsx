import React, { useState } from 'react';
import { ScreenId } from '../types';

interface DemoNavigatorProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const DemoNavigator: React.FC<DemoNavigatorProps> = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const screens: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'splash', label: '1. Brand Splash', icon: 'water_drop' },
    { id: 'onboarding-discover', label: '2. Onboard: Discover', icon: 'auto_awesome' },
    { id: 'onboarding-schedule', label: '3. Onboard: Schedule', icon: 'schedule' },
    { id: 'location', label: '4. Location Picker', icon: 'location_on' },
    { id: 'login', label: '5. Login Auth', icon: 'login' },
    { id: 'signup', label: '6. Sign Up', icon: 'person_add' },
    { id: 'reset-password', label: '7. Reset Password', icon: 'lock_reset' },
    { id: 'home', label: '8. Home Feed', icon: 'home' },
    { id: 'stores', label: '9. Browse Catalog', icon: 'storefront' },
    { id: 'store-detail', label: '10. Hub Catalog', icon: 'local_mall' },
    { id: 'buy-it-again', label: '11. Buy It Again', icon: 'replay' },
    { id: 'cart', label: '12. Shopping Carts', icon: 'shopping_cart' },
    { id: 'order-tracking', label: '13. Live Order Tracking', icon: 'local_shipping' },
    { id: 'transactions', label: '14. Spending History', icon: 'receipt_long' },
    { id: 'profile', label: '15. Profile & Member', icon: 'account_circle' },
    { id: 'payment', label: '16. Digital Wallet & MoMo', icon: 'account_balance_wallet' },
  ];

  return (
    <div className="fixed top-3 right-3 z-50 font-['Hanken_Grotesk']">
      <button
        id="demo-screen-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#1c1b1b]/90 text-white hover:bg-black px-3.5 py-1.5 rounded-full font-['JetBrains_Mono'] text-[11px] font-bold flex items-center gap-1.5 shadow-2xl border border-white/20 backdrop-blur-md active:scale-95 transition-all"
        title="Quick jump to any screen"
      >
        <span className="w-2 h-2 rounded-full bg-[#9c3f00] animate-ping"></span>
        <span className="uppercase tracking-wider">Screen Previewer</span>
        <span className="material-symbols-outlined text-sm">
          {isOpen ? 'expand_less' : 'unfold_more'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-72 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-2xl shadow-2xl p-3 space-y-1.5 max-h-[80vh] overflow-y-auto animate-fade-in">
          <div className="px-2 py-1 flex justify-between items-center border-b border-stone-100 mb-1">
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase font-extrabold text-[#9c3f00] tracking-wider">
              Jump to Screen
            </span>
            <span className="text-[10px] text-stone-400 font-['JetBrains_Mono']">
              Current: {currentScreen}
            </span>
          </div>

          <div className="space-y-1">
            {screens.map((s) => {
              const isActive = currentScreen === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    onNavigate(s.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-[#9c3f00] text-white shadow-md'
                      : 'text-[#1c1b1b] hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">{s.icon}</span>
                    <span>{s.label}</span>
                  </div>
                  {isActive && <span className="material-symbols-outlined text-xs">check</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
