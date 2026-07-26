import React from 'react';
import { ScreenId } from '../types';
import type { ApiOrder, ApiOrderStatus } from '../api/types';

interface TransactionsScreenProps {
  orders: ApiOrder[];
  isLoading: boolean;
  error: string | null;
  onNavigate: (screen: ScreenId) => void;
  onSelectOrder: (order: ApiOrder) => void;
}

const STATUS_LABEL: Record<ApiOrderStatus, string> = {
  placed: 'Placed',
  shopping: 'Being shopped',
  packed: 'Packed',
  in_transit: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_TONE: Record<ApiOrderStatus, string> = {
  placed: 'bg-[#ffdf9f] text-[#765700]',
  shopping: 'bg-[#ffdf9f] text-[#765700]',
  packed: 'bg-[#cfe6ff] text-[#00497d]',
  in_transit: 'bg-[#cfe6ff] text-[#00497d]',
  delivered: 'bg-[#b9eeab] text-[#23501e]',
  cancelled: 'bg-[#ffdad6] text-[#93000a]',
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  orders,
  isLoading,
  error,
  onNavigate,
  onSelectOrder,
}) => {
  if (isLoading) {
    return (
      <div className="px-4 pt-4 space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-stone-200/70 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 px-6">
        <span className="material-symbols-outlined text-5xl text-stone-300">cloud_off</span>
        <h3 className="text-base font-bold text-[#1c1b1b] mt-2">Could not load your orders</h3>
        <p className="text-sm text-[#584238] mt-1">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <span className="material-symbols-outlined text-5xl text-stone-300">receipt_long</span>
        <h3 className="text-base font-bold text-[#1c1b1b] mt-2">No orders yet</h3>
        <p className="text-sm text-[#584238] mt-1">Your order history will appear here.</p>
        <button
          type="button"
          onClick={() => onNavigate('stores')}
          className="mt-4 px-5 py-2.5 bg-[#9c3f00] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
        >
          Start shopping
        </button>
      </div>
    );
  }

  const lifetime = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="pb-6">
      <div className="px-4 pt-3">
        <div className="rounded-2xl bg-white border border-stone-200/70 p-4">
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#584238] font-bold">
            Lifetime spend
          </p>
          <p className="text-2xl font-extrabold text-[#9c3f00] mt-1 tabular-nums">
            ${lifetime.toFixed(2)}
          </p>
          <p className="text-xs text-[#584238] mt-0.5">
            across {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-2.5">
        {orders.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => onSelectOrder(order)}
            className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-stone-200/70 text-left active:scale-[0.99] transition-transform"
          >
            <img
              src={order.storeImageUrl}
              alt=""
              className="h-12 w-12 rounded-xl object-cover bg-stone-100 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm text-[#1c1b1b] truncate">{order.storeName}</h3>
              <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 mt-0.5">
                {formatDate(order.placedAt)} • {order.items.length}{' '}
                {order.items.length === 1 ? 'item' : 'items'}
              </p>
              <span
                className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  STATUS_TONE[order.status]
                }`}
              >
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <span className="font-extrabold text-sm text-[#9c3f00] shrink-0 tabular-nums">
              ${order.total.toFixed(2)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
