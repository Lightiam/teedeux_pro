import React, { useState } from 'react';
import { ScreenId } from '../types';
import type { ApiStoreCart, ApiTotals } from '../api/types';
import { QuantityStepper } from './ui/QuantityStepper';

interface CartScreenProps {
  storeCarts: ApiStoreCart[];
  totals: ApiTotals;
  promoValid: boolean | null;
  isLoading: boolean;
  error: string | null;
  onSetQuantity: (productId: string, quantity: number) => void;
  onClearStore: (storeId: string) => void;
  onApplyPromo: (code: string) => Promise<void>;
  onCheckout: () => Promise<void>;
  onNavigate: (screen: ScreenId) => void;
}

/**
 * One cart per fulfilment hub. Totals come from the server so the figure shown
 * here is the figure that will be charged.
 */
export const CartScreen: React.FC<CartScreenProps> = ({
  storeCarts,
  totals,
  promoValid,
  isLoading,
  error,
  onSetQuantity,
  onClearStore,
  onApplyPromo,
  onCheckout,
  onNavigate,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Default the first hub open, without fighting an explicit collapse.
  const openId = expanded ?? storeCarts[0]?.store.id ?? null;

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    await onApplyPromo(promoCode.trim());
  };

  const checkout = async () => {
    setCheckoutError(null);
    setCheckingOut(true);
    try {
      await onCheckout();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  if (isLoading && storeCarts.length === 0) {
    return (
      <div className="px-4 pt-4 space-y-3">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-stone-200/70 animate-pulse" />
        ))}
      </div>
    );
  }

  if (storeCarts.length === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="h-20 w-20 bg-[#ffdbcc] text-[#9c3f00] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-4xl">shopping_cart</span>
        </div>
        <h3 className="text-lg font-extrabold text-[#1c1b1b]">Your cart is empty</h3>
        <p className="text-sm text-[#584238] mt-1">
          Add items from any hub and they'll collect here.
        </p>
        {error && <p className="text-xs text-[#9E2A2B] mt-3">{error}</p>}
        <button
          type="button"
          onClick={() => onNavigate('stores')}
          className="mt-5 px-6 py-3 bg-[#9c3f00] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
        >
          Browse the catalog
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-4">
      <div className="px-4 pt-3">
        <p className="text-xs text-[#584238]">
          {storeCarts.length} {storeCarts.length === 1 ? 'hub' : 'hubs'} • each ships separately
        </p>
      </div>

      {error && (
        <p className="mx-4 text-xs text-[#93000a] bg-[#ffdad6] rounded-xl px-3 py-2">{error}</p>
      )}

      {/* Per-hub carts */}
      <div className="px-4 space-y-3">
        {storeCarts.map((cart) => {
          const isOpen = openId === cart.store.id;

          return (
            <section
              key={cart.store.id}
              className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? '' : cart.store.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 p-3 text-left active:bg-stone-50 transition-colors"
              >
                <img
                  src={cart.store.imageUrl}
                  alt=""
                  className="h-11 w-11 rounded-xl object-cover bg-stone-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[#1c1b1b] truncate">{cart.store.name}</h3>
                  <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 mt-0.5">
                    {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} • $
                    {cart.subtotal.toFixed(2)}
                  </p>
                </div>
                <span
                  className={`material-symbols-outlined text-stone-400 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-stone-100">
                  {cart.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 border-b border-stone-50 last:border-b-0"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt=""
                        className="h-14 w-14 rounded-xl object-contain bg-[#f6f3f2] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-[#1c1b1b] line-clamp-2 leading-snug">
                          {item.product.name}
                        </p>
                        <p className="font-['JetBrains_Mono'] text-[10px] text-stone-500 mt-0.5">
                          {item.product.weightOrUnit}
                        </p>
                        <p className="font-extrabold text-sm text-[#9c3f00] mt-1">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <QuantityStepper
                        quantity={item.quantity}
                        onIncrement={() => onSetQuantity(item.product.id, item.quantity + 1)}
                        onDecrement={() => onSetQuantity(item.product.id, item.quantity - 1)}
                        label={item.product.name}
                      />
                    </div>
                  ))}

                  <div className="p-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onClearStore(cart.store.id)}
                      className="text-xs font-bold text-[#9E2A2B] active:opacity-60"
                    >
                      Empty this cart
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Promo */}
      <form onSubmit={applyPromo} className="px-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Promo code"
            aria-label="Promo code"
            className="flex-1 h-11 px-4 rounded-full bg-white border border-stone-200 text-sm outline-none focus:border-[#9c3f00] focus:ring-2 focus:ring-[#9c3f00]/15 transition-all placeholder:text-stone-400"
          />
          <button
            type="submit"
            className="px-5 h-11 rounded-full bg-[#1c1b1b] text-white text-sm font-bold active:scale-95 transition-transform shrink-0"
          >
            Apply
          </button>
        </div>
        {promoValid !== null && (
          <p
            className={`text-xs mt-2 px-1 font-semibold ${
              promoValid ? 'text-[#3b6934]' : 'text-[#9E2A2B]'
            }`}
          >
            {promoValid
              ? `Code applied — $${totals.discount.toFixed(2)} off`
              : 'Invalid code. Try FRESH or AFRICA10'}
          </p>
        )}
      </form>

      {/* Totals — all figures come from the server */}
      <div className="px-4">
        <div className="bg-white rounded-2xl border border-stone-200/70 p-4 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-[#584238]">Subtotal</span>
            <span className="font-semibold tabular-nums">${totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#584238]">Delivery</span>
            <span className="font-semibold tabular-nums">
              {totals.deliveryFee === 0 ? (
                <span className="text-[#3b6934]">Free</span>
              ) : (
                `$${totals.deliveryFee.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#584238]">Service fee</span>
            <span className="font-semibold tabular-nums">${totals.serviceFee.toFixed(2)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-sm text-[#3b6934]">
              <span>Discount</span>
              <span className="font-semibold tabular-nums">−${totals.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2.5 border-t border-stone-100">
            <span className="font-extrabold text-[#1c1b1b]">Total</span>
            <span className="font-extrabold text-lg text-[#9c3f00] tabular-nums">
              ${totals.total.toFixed(2)}
            </span>
          </div>

          {totals.amountToFreeDelivery > 0 && (
            <p className="text-[11px] text-[#584238] bg-[#f6f3f2] rounded-xl px-3 py-2 mt-1">
              Add ${totals.amountToFreeDelivery.toFixed(2)} more for free delivery
            </p>
          )}
        </div>
      </div>

      {/* Checkout */}
      <div className="px-4 pt-1 space-y-2">
        {checkoutError && (
          <p className="text-xs text-[#93000a] bg-[#ffdad6] rounded-xl px-3 py-2">
            {checkoutError}
          </p>
        )}
        <button
          type="button"
          onClick={checkout}
          disabled={checkingOut}
          className="w-full py-3.5 rounded-full bg-[#9c3f00] text-white font-extrabold text-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:active:scale-100"
        >
          {checkingOut ? (
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-xl">lock</span>
          )}
          {checkingOut ? 'Placing order…' : `Checkout • $${totals.total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
};
