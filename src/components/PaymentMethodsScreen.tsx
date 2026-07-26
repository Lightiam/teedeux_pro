import React, { useState } from 'react';
import { ScreenId } from '../types';
import type { ApiUser } from '../api/types';
import { profileApi } from '../api/endpoints';
import { BottomSheet } from './ui/BottomSheet';

interface PaymentMethodsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  walletBalance: number;
  loyaltyPoints: number;
  onUserUpdated: (user: ApiUser) => void;
}

const QUICK_AMOUNTS = [25, 50, 100, 250];

/** Cosmetic — no payment provider is wired up behind these. */
const METHODS = [
  { id: 'apple', label: 'Apple Pay', icon: 'phone_iphone' },
  { id: 'card', label: 'Card ending 4412', icon: 'credit_card' },
  { id: 'zelle', label: 'Zelle transfer', icon: 'account_balance' },
] as const;

export const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({
  onNavigate,
  walletBalance,
  loyaltyPoints,
  onUserUpdated,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [amount, setAmount] = useState('50');
  const [method, setMethod] = useState<(typeof METHODS)[number]['id']>('apple');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than zero');
      return;
    }

    setBusy(true);
    try {
      const { user } = await profileApi.topUpWallet(value);
      onUserUpdated(user);
      setSheetOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-6 space-y-4">
      {/* Wallet */}
      <div className="px-4 pt-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#9c3f00] to-[#c45100] text-white p-5">
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-white/80 font-bold">
            Teedeux wallet
          </p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">${walletBalance.toFixed(2)}</p>
          <p className="text-xs text-white/85 mt-1">{loyaltyPoints} loyalty points</p>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="mt-4 w-full py-3 rounded-full bg-white text-[#9c3f00] font-bold text-sm active:scale-[0.98] transition-transform"
          >
            Add money
          </button>
        </div>
      </div>

      {/* Methods */}
      <div className="px-4 space-y-2">
        <h2 className="font-extrabold text-sm text-[#1c1b1b] px-1">Payment methods</h2>
        {METHODS.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-stone-200/70"
          >
            <span className="material-symbols-outlined text-[#9c3f00] shrink-0">{entry.icon}</span>
            <span className="flex-1 font-semibold text-sm text-[#1c1b1b]">{entry.label}</span>
            {entry.id === 'apple' && (
              <span className="px-2 py-0.5 rounded-md bg-[#b9eeab]/40 text-[#23501e] text-[10px] font-bold">
                Default
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={() => onNavigate('transactions')}
          className="w-full flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-stone-200/70 active:scale-[0.99] transition-transform text-left"
        >
          <span className="material-symbols-outlined text-[#9c3f00] shrink-0">receipt_long</span>
          <span className="flex-1 font-semibold text-sm text-[#1c1b1b]">Order history</span>
          <span className="material-symbols-outlined text-stone-400 shrink-0">chevron_right</span>
        </button>
      </div>

      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Add money"
        footer={
          <button
            type="submit"
            form="top-up-form"
            disabled={busy}
            className="w-full h-12 rounded-full bg-[#9c3f00] text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {busy ? 'Adding…' : `Add $${Number.parseFloat(amount || '0').toFixed(2)}`}
          </button>
        }
      >
        <form id="top-up-form" onSubmit={topUp} className="px-5 py-4 space-y-4">
          {error && (
            <p className="text-xs text-[#93000a] bg-[#ffdad6] rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(String(value))}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  amount === String(value)
                    ? 'bg-[#9c3f00] text-white border-[#9c3f00]'
                    : 'bg-white text-[#584238] border-stone-200'
                }`}
              >
                ${value}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="top-up-amount" className="block text-xs font-bold text-[#584238]">
              Amount
            </label>
            <input
              id="top-up-amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-[#f6f3f2] border border-stone-200 text-sm outline-none focus:border-[#9c3f00] focus:ring-2 focus:ring-[#9c3f00]/15"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-[#584238]">Pay with</p>
            {METHODS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setMethod(entry.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  method === entry.id
                    ? 'border-[#9c3f00] bg-[#ffdbcc]/40'
                    : 'border-stone-200 bg-white'
                }`}
              >
                <span className="material-symbols-outlined text-[#9c3f00] shrink-0">
                  {entry.icon}
                </span>
                <span className="flex-1 text-left font-semibold text-sm text-[#1c1b1b]">
                  {entry.label}
                </span>
                {method === entry.id && (
                  <span className="material-symbols-outlined text-[#9c3f00] text-lg fill-1">
                    check_circle
                  </span>
                )}
              </button>
            ))}
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
