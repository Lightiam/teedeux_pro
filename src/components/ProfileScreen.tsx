import React from 'react';
import { ScreenId, UserProfile } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  onNavigate: (screen: ScreenId) => void;
  onSignOut?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, onSignOut }) => {
  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen pb-32 font-['Hanken_Grotesk']">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffdbcc] rounded-full blur-2xl opacity-60 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
            <div className="relative">
              <img
                className="w-24 h-24 rounded-full object-cover border-4 border-[#9c3f00] p-0.5 shadow-xl"
                src={user.avatarUrl}
                alt={user.name}
              />
              <span className="absolute bottom-0 right-0 bg-[#3b6934] text-white p-1.5 rounded-full shadow-md border-2 border-white flex items-center justify-center">
                <span className="material-symbols-outlined text-xs fill-1">verified</span>
              </span>
            </div>

            <div className="flex-grow space-y-1">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#1c1b1b]">{user.name}</h1>
                {user.isPlusMember && (
                  <span className="bg-gradient-to-r from-amber-500 to-amber-700 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase font-['JetBrains_Mono'] shadow-sm">
                    Teedeux Plus Member
                  </span>
                )}
              </div>
              <p className="font-['JetBrains_Mono'] text-xs text-[#584238]">{user.email}</p>
              <p className="font-['JetBrains_Mono'] text-xs text-[#584238]">{user.phone}</p>
            </div>

            <button
              onClick={() => alert('Profile editing modal opened.')}
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-[#584238] text-xs font-bold flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit</span>
            </button>
          </div>

          {/* Wallet Quick Balance Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-stone-100 text-center font-['JetBrains_Mono']">
            <div
              onClick={() => onNavigate('payment')}
              className="cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <span className="text-xs text-[#584238] uppercase block">Wallet Balance</span>
              <span className="text-lg font-extrabold text-[#9c3f00] font-['Hanken_Grotesk']">
                ${user.walletBalance.toFixed(2)}
              </span>
            </div>
            <div
              onClick={() => onNavigate('payment')}
              className="cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <span className="text-xs text-[#584238] uppercase block">Loyalty Points</span>
              <span className="text-lg font-extrabold text-[#3b6934] font-['Hanken_Grotesk']">
                {user.loyaltyPoints} pts
              </span>
            </div>
            <div
              onClick={() => onNavigate('transactions')}
              className="cursor-pointer p-2 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <span className="text-xs text-[#584238] uppercase block">Total Orders</span>
              <span className="text-lg font-extrabold text-[#1c1b1b] font-['Hanken_Grotesk']">
                18
              </span>
            </div>
          </div>
        </div>

        {/* Teedeux Plus Gold Banner */}
        <div className="bg-gradient-to-r from-[#9c3f00] to-[#c45100] text-white p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-amber-200">
              Gold Tier Benefits
            </span>
            <h3 className="font-extrabold text-xl">Unlimited Free US Express Delivery</h3>
            <p className="text-xs text-white/90">
              Plus member savings: You've saved $140.00 in delivery fees this month across the US.
            </p>
          </div>
          <span className="material-symbols-outlined text-5xl text-amber-300">workspace_premium</span>
        </div>

        {/* Account Settings Menu List */}
        <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm overflow-hidden divide-y divide-stone-100">
          <button
            onClick={() => onNavigate('location')}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ffdbcc] text-[#9c3f00]">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1c1b1b]">Saved Delivery Addresses</h4>
                <p className="text-xs text-[#584238]">1234 Westheimer Rd, Houston, TX 77006 (Default)</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400">chevron_right</span>
          </button>

          <button
            onClick={() => onNavigate('payment')}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#b9eeab] text-[#1E3F1B]">
                <span className="material-symbols-outlined">credit_card</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1c1b1b]">Payment Methods & Digital Wallet</h4>
                <p className="text-xs text-[#584238]">Apple Pay, Chase VISA ending 4242, Zelle</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400">chevron_right</span>
          </button>

          <button
            onClick={() => onNavigate('transactions')}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-stone-100 text-[#584238]">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1c1b1b]">Spending & Order History</h4>
                <p className="text-xs text-[#584238]">Download receipts & reorder favorites</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400">chevron_right</span>
          </button>

          <button
            onClick={() => alert('Cuisine preferences updated to: West African, Halal, Organic')}
            className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <span className="material-symbols-outlined">restaurant_menu</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1c1b1b]">Dietary & Spice Preferences</h4>
                <p className="text-xs text-[#584238]">Halal, Organic Produce, High-Spice Suya</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-stone-400">chevron_right</span>
          </button>

          <button
            onClick={() => {
              if (onSignOut) onSignOut();
              onNavigate('login');
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-red-600">Sign Out</h4>
                <p className="text-xs text-red-400">Log out of Teedeux Mart on this device</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-red-400">chevron_right</span>
          </button>
        </div>
      </main>
    </div>
  );
};
