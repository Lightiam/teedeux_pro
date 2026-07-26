import React, { useState } from 'react';
import { ScreenId } from '../types';
import { mockTransactions } from '../data/mockData';

interface TransactionsScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState('This Month');

  const filterOptions = ['This Month', 'Last 30 Days', '2026 Q1', 'All Time'];

  return (
    <div className="bg-[#fcf9f8] text-[#1c1b1b] min-h-screen pb-32 font-['Hanken_Grotesk']">
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        <div className="flex justify-between items-center border-b border-stone-200/60 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1c1b1b]">Spending History</h1>
            <p className="text-xs text-[#584238] font-['JetBrains_Mono'] mt-0.5">
              Track your authentic grocery orders and downloadable tax receipts.
            </p>
          </div>

          <button
            onClick={() => onNavigate('payment')}
            className="px-4 py-2 bg-[#9c3f00] text-white rounded-xl text-xs font-bold hover:bg-[#c45100] flex items-center gap-1.5 shadow-md"
          >
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            <span>Wallet & Balance</span>
          </button>
        </div>

        {/* Monthly Spending Bento Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm flex flex-col justify-between">
            <span className="font-['JetBrains_Mono'] text-xs text-[#584238] uppercase font-bold">
              Total Spent (2026)
            </span>
            <div className="my-2">
              <span className="font-['Hanken_Grotesk'] text-3xl font-extrabold text-[#9c3f00]">
                $4,280.00
              </span>
              <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>12% less than last month</span>
              </p>
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-stone-400">
              Updated 10 mins ago
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm flex flex-col justify-between">
            <span className="font-['JetBrains_Mono'] text-xs text-[#584238] uppercase font-bold">
              Completed Orders
            </span>
            <div className="my-2">
              <span className="font-['Hanken_Grotesk'] text-3xl font-extrabold text-[#1E3F1B]">
                18 Orders
              </span>
              <p className="text-xs text-[#584238] font-bold mt-1">100% On-time delivery rate</p>
            </div>
            <span className="font-['JetBrains_Mono'] text-[11px] text-stone-400">
              1 Active in transit
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200/60 shadow-sm flex flex-col justify-between">
            <span className="font-['JetBrains_Mono'] text-xs text-[#584238] uppercase font-bold">
              Top Category
            </span>
            <div className="my-2">
              <span className="font-['Hanken_Grotesk'] text-2xl font-extrabold text-[#9c3f00]">
                Spices & Grains
              </span>
              <p className="text-xs text-[#584238] font-bold mt-1">Mama Jones Market (14 orders)</p>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#9c3f00] h-full w-[65%]"></div>
            </div>
          </div>
        </div>

        {/* Date Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-4 py-2 rounded-full text-xs font-bold font-['JetBrains_Mono'] transition-all ${
                filter === opt
                  ? 'bg-[#9c3f00] text-white shadow-md'
                  : 'bg-stone-200/70 text-[#584238] hover:bg-stone-300'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Transactions Table List */}
        <div className="space-y-3">
          {mockTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#ffdbcc] text-[#9c3f00] flex items-center justify-center font-bold text-xl flex-shrink-0">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#1c1b1b]">{tx.storeName}</h3>
                    <span className="bg-[#b9eeab] text-[#1E3F1B] px-2 py-0.5 rounded text-[10px] font-bold uppercase font-['JetBrains_Mono']">
                      {tx.status}
                    </span>
                  </div>
                  <p className="font-['JetBrains_Mono'] text-xs text-[#584238] mt-0.5">
                    {tx.date} • {tx.itemSummary}
                  </p>
                  <p className="text-[11px] text-stone-400 font-['JetBrains_Mono']">
                    Payment via {tx.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-stone-100 pt-3 sm:pt-0">
                <span className="font-extrabold text-xl text-[#9c3f00] font-['Hanken_Grotesk']">
                  ${tx.amount.toFixed(2)}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Receipt downloaded for ${tx.id}`)}
                    className="p-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-[#584238] text-xs font-bold flex items-center gap-1"
                    title="Download PDF Receipt"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                  </button>
                  <button
                    onClick={() => onNavigate('store-detail')}
                    className="px-3 py-2 bg-[#9c3f00] text-white hover:bg-[#c45100] rounded-xl text-xs font-bold"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
