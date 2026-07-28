import React, { useState } from 'react';
import { ScreenId } from '../types';
import type { ApiOrder, ApiOrderStatus } from '../api/types';

interface OrderTrackingScreenProps {
  order: ApiOrder | null;
  isLoading: boolean;
  onNavigate: (screen: ScreenId) => void;
  onAdvance: (orderId: string, status: ApiOrderStatus) => Promise<void>;
  /** False when status transitions are server-only and no server is deployed. */
  canAdvance: boolean;
  /** True when no server has priced this order, so the total is an estimate. */
  pricingPending: boolean;
}

interface Step {
  status: ApiOrderStatus;
  label: string;
  detail: string;
  icon: string;
}

const STEPS: Step[] = [
  { status: 'placed', label: 'Order placed', detail: 'We have your order', icon: 'receipt_long' },
  { status: 'shopping', label: 'Being shopped', detail: 'Picking your items', icon: 'shopping_basket' },
  { status: 'packed', label: 'Packed', detail: 'Sealed and labelled', icon: 'inventory_2' },
  { status: 'in_transit', label: 'On the way', detail: 'Out for delivery', icon: 'local_shipping' },
  { status: 'delivered', label: 'Delivered', detail: 'Enjoy your order', icon: 'home' },
];

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  order,
  isLoading,
  onNavigate,
  onAdvance,
  canAdvance,
  pricingPending,
}) => {
  const [busy, setBusy] = useState(false);

  if (isLoading) {
    return (
      <div className="px-4 pt-4 space-y-3">
        <div className="h-24 rounded-2xl bg-stone-200/70 animate-pulse" />
        <div className="h-64 rounded-2xl bg-stone-200/70 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 px-6">
        <span className="material-symbols-outlined text-5xl text-stone-300">local_shipping</span>
        <h3 className="text-base font-bold text-[#1c1b1b] mt-2">Nothing to track</h3>
        <p className="text-sm text-[#584238] mt-1">
          Place an order and you can follow it here.
        </p>
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

  const isCancelled = order.status === 'cancelled';
  const currentIndex = STEPS.findIndex((step) => step.status === order.status);
  const nextStep = currentIndex >= 0 ? STEPS[currentIndex + 1] : undefined;

  const advance = async (status: ApiOrderStatus) => {
    setBusy(true);
    try {
      await onAdvance(order.id, status);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-6 space-y-4">
      {/* Order summary */}
      <div className="px-4 pt-3">
        <div className="bg-white rounded-2xl border border-stone-200/70 p-4 flex items-center gap-3">
          <img
            src={order.storeImageUrl}
            alt=""
            className="h-12 w-12 rounded-xl object-cover bg-stone-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm text-[#1c1b1b] truncate">{order.storeName}</h2>
            <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 mt-0.5 truncate">
              {order.id}
            </p>
          </div>
          <span className="flex flex-col items-end shrink-0">
            <span className="font-extrabold text-sm text-[#9c3f00] tabular-nums">
              ${order.total.toFixed(2)}
            </span>
            {pricingPending && (
              <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#584238]">
                estimate
              </span>
            )}
          </span>
        </div>

        {pricingPending && (
          <div className="mt-2 flex items-start gap-2 rounded-2xl bg-[#ffdf9f]/50 px-3 py-2.5">
            <span className="material-symbols-outlined text-[#765700] text-base shrink-0">
              schedule
            </span>
            <p className="text-[11px] text-[#765700] leading-relaxed">
              Your final total is confirmed once the hub packs your order — weights and
              substitutions can change it.
            </p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-stone-200/70 p-4">
          {isCancelled ? (
            <div className="flex items-center gap-3 text-[#93000a]">
              <span className="material-symbols-outlined text-2xl">cancel</span>
              <div>
                <p className="font-bold text-sm">Order cancelled</p>
                <p className="text-xs text-[#584238] mt-0.5">This order will not be delivered.</p>
              </div>
            </div>
          ) : (
            <ol className="space-y-0">
              {STEPS.map((step, index) => {
                const isDone = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isLast = index === STEPS.length - 1;

                return (
                  <li key={step.status} className="flex gap-3">
                    {/* Rail */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isDone
                            ? 'bg-[#3b6934] text-white'
                            : isCurrent
                              ? 'bg-[#9c3f00] text-white'
                              : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-lg ${
                            isDone || isCurrent ? 'fill-1' : ''
                          }`}
                        >
                          {isDone ? 'check' : step.icon}
                        </span>
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 flex-1 min-h-[1.75rem] ${
                            isDone ? 'bg-[#3b6934]' : 'bg-stone-200'
                          }`}
                        />
                      )}
                    </div>

                    {/* Copy */}
                    <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
                      <p
                        className={`text-sm font-bold ${
                          isDone || isCurrent ? 'text-[#1c1b1b]' : 'text-stone-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-[#584238] mt-0.5">{step.detail}</p>
                      {isCurrent && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#ffdbcc] text-[#9c3f00] text-[10px] font-bold">
                          Current
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      {/* Delivery address */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-stone-200/70 p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#9c3f00] fill-1 shrink-0">
            location_on
          </span>
          <div className="min-w-0">
            <p className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#584238] font-bold">
              Delivering to
            </p>
            <p className="text-sm text-[#1c1b1b] mt-0.5">{order.deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-3 p-3 border-b border-stone-50 last:border-b-0"
            >
              <img
                src={item.imageUrl}
                alt=""
                className="h-12 w-12 rounded-xl object-contain bg-[#f6f3f2] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#1c1b1b] line-clamp-2 leading-snug">
                  {item.name}
                </p>
                <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 mt-0.5">
                  {item.weightOrUnit} × {item.quantity}
                </p>
              </div>
              <span className="font-bold text-sm text-[#9c3f00] tabular-nums shrink-0">
                ${(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/*
        Standing in for the courier and warehouse systems that would drive
        status in production, so the flow can be walked end to end.
      */}
      {canAdvance && !isCancelled && nextStep && (
        <div className="px-4 space-y-2">
          <p className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#584238] font-bold px-1">
            Demo controls
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => advance(nextStep.status)}
              className="flex-1 py-3 rounded-full bg-[#9c3f00] text-white font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              Advance to {nextStep.label.toLowerCase()}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => advance('cancelled')}
              className="px-5 py-3 rounded-full bg-white border border-stone-200 text-[#9E2A2B] font-bold text-sm active:scale-95 transition-transform disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
