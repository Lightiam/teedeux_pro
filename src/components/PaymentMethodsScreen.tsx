import React, { useState } from 'react';
import { ScreenId } from '../types';

interface PaymentMethodsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  walletBalance: number;
  loyaltyPoints: number;
  onTopUpWallet?: (amount: number) => void;
}

export const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({
  onNavigate,
  walletBalance,
  loyaltyPoints,
  onTopUpWallet,
}) => {
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('100');
  const [selectedProvider, setSelectedProvider] = useState<'apple' | 'card' | 'zelle'>('apple');

  const handleConfirmTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(topUpAmount);
    if (!isNaN(val) && val > 0) {
      if (onTopUpWallet) onTopUpWallet(val);
      alert(`Successfully added $${val.toFixed(2)} to your Teedeux Wallet!`);
      setShowTopUpModal(false);
    }
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen pb-32 font-['Hanken_Grotesk']">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex justify-between items-center border-b border-stone-200/60 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c1b1b]">Digital Wallet & Payments</h1>
            <p className="text-xs text-[#584238] font-['JetBrains_Mono'] mt-0.5">
              Instant checkout with Apple Pay, Cards, Zelle, or Wallet Credits.
            </p>
          </div>

          <button
            onClick={() => onNavigate('transactions')}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-[#584238] font-bold text-xs rounded-xl"
          >
            History
          </button>
        </div>

        {/* Digital Wallet Card */}
        <div className="bg-gradient-to-br from-[#9c3f00] via-[#c45100] to-[#762b00] text-white p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <span className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider text-amber-200">
                Teedeux Pay Balance
              </span>
              <h2 className="font-['Hanken_Grotesk'] text-4xl sm:text-5xl font-extrabold mt-1">
                ${walletBalance.toFixed(2)}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-white/20 relative z-10">
            <div className="font-['JetBrains_Mono'] text-xs text-white/90">
              <span>Loyalty Points: </span>
              <strong className="text-amber-300 font-extrabold">{loyaltyPoints} pts</strong>
              <span className="text-[10px] block text-white/70">
                (Worth ${(loyaltyPoints * 0.1).toFixed(2)} discount)
              </span>
            </div>

            <button
              onClick={() => setShowTopUpModal(true)}
              className="px-6 py-3 bg-white text-[#9c3f00] rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-amber-50 active:scale-95 transition-all shadow-lg flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Top Up Wallet</span>
            </button>
          </div>
        </div>

        {/* Saved Payment Methods Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-[#1c1b1b]">Saved Payment Methods</h3>

          <div className="space-y-3">
            {/* Apple Pay */}
            <div className="bg-white p-5 rounded-2xl border-2 border-[#9c3f00] shadow-md flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-black text-white font-extrabold text-xs flex items-center justify-center p-1 shadow-sm">
                  Apple Pay
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[#1c1b1b]">Apple Pay</h4>
                    <span className="bg-[#b9eeab] text-[#1E3F1B] text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['JetBrains_Mono']">
                      Default
                    </span>
                  </div>
                  <p className="font-['JetBrains_Mono'] text-xs text-[#584238]">Express Touch ID / Face ID</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#9c3f00] fill-1 text-2xl">
                check_circle
              </span>
            </div>

            {/* Chase Visa Card */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm flex justify-between items-center hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center p-1 shadow-sm">
                  VISA
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#1c1b1b]">Chase Freedom Unlimited</h4>
                  <p className="font-['JetBrains_Mono'] text-xs text-[#584238]">•••• •••• •••• 4242</p>
                </div>
              </div>
              <button
                onClick={() => alert('Set Chase VISA as default method')}
                className="text-xs font-bold text-[#584238] hover:text-[#9c3f00]"
              >
                Set Default
              </button>
            </div>

            {/* Zelle */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm flex justify-between items-center hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-700 text-white font-extrabold text-xs flex items-center justify-center p-1 shadow-sm">
                  Zelle
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#1c1b1b]">Zelle Direct Transfer</h4>
                  <p className="font-['JetBrains_Mono'] text-xs text-[#584238]">marcus.vance@example.com</p>
                </div>
              </div>
              <button
                onClick={() => alert('Set Zelle as default method')}
                className="text-xs font-bold text-[#584238] hover:text-[#9c3f00]"
              >
                Set Default
              </button>
            </div>
          </div>

          <button
            onClick={() => alert('Opening new payment method form...')}
            className="w-full py-3.5 border-2 border-dashed border-stone-300 rounded-2xl text-[#584238] font-bold text-sm hover:border-[#9c3f00] hover:text-[#9c3f00] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_card</span>
            <span>Add New Card, Bank Account, or Apple Pay</span>
          </button>
        </div>
      </main>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-lg text-[#1c1b1b]">Top Up Teedeux Wallet</h3>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmTopUp} className="space-y-4">
              <div>
                <label className="font-['JetBrains_Mono'] text-xs font-bold text-[#584238] block mb-1">
                  Amount (USD $)
                </label>
                <input
                  type="number"
                  min="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full p-3 bg-stone-100 rounded-xl font-['Hanken_Grotesk'] font-extrabold text-2xl text-[#9c3f00] outline-none"
                />
              </div>

              <div>
                <label className="font-['JetBrains_Mono'] text-xs font-bold text-[#584238] block mb-2">
                  Select Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('apple')}
                    className={`p-3 rounded-xl font-bold text-xs border ${
                      selectedProvider === 'apple'
                        ? 'border-[#9c3f00] bg-[#ffdbcc]/40 text-[#9c3f00]'
                        : 'border-stone-200'
                    }`}
                  >
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('card')}
                    className={`p-3 rounded-xl font-bold text-xs border ${
                      selectedProvider === 'card'
                        ? 'border-[#9c3f00] bg-[#ffdbcc]/40 text-[#9c3f00]'
                        : 'border-stone-200'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('zelle')}
                    className={`p-3 rounded-xl font-bold text-xs border ${
                      selectedProvider === 'zelle'
                        ? 'border-[#9c3f00] bg-[#ffdbcc]/40 text-[#9c3f00]'
                        : 'border-stone-200'
                    }`}
                  >
                    Zelle
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#9c3f00] text-white rounded-xl font-extrabold text-base hover:bg-[#c45100] shadow-lg"
              >
                Confirm Top Up (${topUpAmount})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
