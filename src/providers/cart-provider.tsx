'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useCartStore } from '@/stores/cart-store';
import type { CartItem, Vendor } from '@/types/models';

interface CartContextType {
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, vendor?: Vendor) => void;
}

const CartContext = createContext<CartContextType | null>(null);

/**
 * Silent multi-restaurant cart: adding from a different vendor never clears the
 * current cart — it opens a second cart. No confirmation dialog (this is the
 * differentiating behavior from the mobile spec §8).
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const addItem = useCartStore((s) => s.addItem);

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'> & { quantity?: number }, vendor?: Vendor) => {
      addItem(item, vendor);
    },
    [addItem]
  );

  return <CartContext.Provider value={{ addToCart }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
