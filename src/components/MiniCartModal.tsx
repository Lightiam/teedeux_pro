import React from 'react';
import { ScreenId, CartItem } from '../types';

interface MiniCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onNavigate: (screen: ScreenId) => void;
}

export const MiniCartModal: React.FC<MiniCartModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((a, b) => a + b.product.price * b.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#9c3f00]">shopping_basket</span>
            <h3 className="font-extrabold text-lg text-[#1c1b1b]">Quick Cart Overview</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Item List */}
        <div className="flex-grow overflow-y-auto space-y-3 py-2">
          {cartItems.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-3 p-2 bg-stone-50 rounded-xl"
            >
              <img
                className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                src={item.product.imageUrl}
                alt={item.product.name}
              />
              <div className="flex-grow">
                <h4 className="font-bold text-xs text-[#1c1b1b] line-clamp-1">
                  {item.product.name}
                </h4>
                <p className="font-['JetBrains_Mono'] text-[11px] text-[#584238]">
                  Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                </p>
              </div>
              <span className="font-extrabold text-sm text-[#9c3f00]">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-100 pt-3 space-y-3">
          <div className="flex justify-between items-center font-['JetBrains_Mono']">
            <span className="text-xs text-[#584238] uppercase font-bold">Subtotal</span>
            <span className="font-extrabold text-xl text-[#9c3f00]">${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onClose();
                onNavigate('cart');
              }}
              className="py-3 px-4 bg-stone-100 text-[#584238] font-bold text-xs rounded-xl hover:bg-stone-200"
            >
              View Full Cart
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('order-tracking');
              }}
              className="py-3 px-4 bg-[#9c3f00] text-white font-bold text-xs rounded-xl hover:bg-[#c45100] shadow-md"
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
