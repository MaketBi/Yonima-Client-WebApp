'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useCartStore } from '@/stores/cart-store';
import { CartVendorDialog } from '@/components/cart/cart-vendor-dialog';
import type { CartItem, Vendor } from '@/types/models';

type PendingItem = {
  item: Omit<CartItem, 'quantity'> & { quantity?: number };
  vendor?: Vendor;
};

interface CartContextType {
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, vendor?: Vendor) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { items, vendorId, establishment, addItem, clear } = useCartStore();
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const addToCart = useCallback(
    (item: Omit<CartItem, 'quantity'> & { quantity?: number }, vendor?: Vendor) => {
      // If cart is empty or same vendor, add directly
      if (items.length === 0 || vendorId === item.vendor_id) {
        addItem(item, vendor);
        return;
      }

      // Different vendor - show confirmation dialog
      setPendingItem({ item, vendor });
      setDialogOpen(true);
    },
    [items.length, vendorId, addItem]
  );

  const handleConfirm = useCallback(() => {
    if (pendingItem) {
      clear();
      addItem(pendingItem.item, pendingItem.vendor);
      setPendingItem(null);
    }
    setDialogOpen(false);
  }, [pendingItem, clear, addItem]);

  const handleCancel = useCallback(() => {
    setPendingItem(null);
    setDialogOpen(false);
  }, []);

  return (
    <CartContext.Provider value={{ addToCart }}>
      {children}
      <CartVendorDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCancel();
        }}
        currentVendorName={establishment?.name || 'une autre boutique'}
        newVendorName={pendingItem?.vendor?.name || 'cette boutique'}
        onConfirm={handleConfirm}
      />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
