import React, { createContext, useContext } from 'react';
import { useCart } from './shared/useCart';
import { mockProducts, mockStores } from './shared/mockData';

type CartApi = ReturnType<typeof useCart>;

const CartContext = createContext<CartApi | null>(null);

/**
 * Wraps the web app's cart hook so every screen in the navigator reads the same
 * cart without threading props through the tab and stack navigators.
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cart = useCart(
    [
      { product: mockProducts[0], quantity: 2 },
      { product: mockProducts[3], quantity: 1 },
    ],
    mockStores
  );

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};

export function useCartContext(): CartApi {
  const cart = useContext(CartContext);
  if (!cart) {
    throw new Error('useCartContext must be used inside a CartProvider');
  }
  return cart;
}
