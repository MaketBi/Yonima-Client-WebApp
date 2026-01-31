'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Vendor } from '@/types/models';

interface CartStore {
  items: CartItem[];
  vendorId: string | null;
  establishment: Vendor | null;

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }, vendor?: Vendor) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  clear: () => void;
  setEstablishment: (establishment: Vendor) => void;
  canAddFromEstablishment: (vendorId: string) => boolean;

  // Computed (using getters via selectors)
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      vendorId: null,
      establishment: null,

      addItem: (item, vendor) => {
        const { items, vendorId } = get();

        // Check if cart is from different vendor
        if (vendorId && vendorId !== item.vendor_id) {
          // Clear cart before adding from new vendor
          set({ items: [], vendorId: null, establishment: null });
        }

        const existingIndex = items.findIndex(
          (i) => i.id === item.id && i.type === item.type
        );

        if (existingIndex > -1) {
          // Update quantity
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += item.quantity ?? 1;
          set({ items: updatedItems });
        } else {
          // Add new item and set establishment if provided
          set({
            items: [...items, { ...item, quantity: item.quantity ?? 1 }],
            vendorId: item.vendor_id,
            ...(vendor && { establishment: vendor }),
          });
        }
      },

      removeItem: (id) => {
        const { items } = get();
        const updatedItems = items.filter((i) => i.id !== id);

        if (updatedItems.length === 0) {
          set({ items: [], vendorId: null, establishment: null });
        } else {
          set({ items: updatedItems });
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const { items } = get();
        const updatedItems = items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: updatedItems });
      },

      incrementQuantity: (id) => {
        const { items } = get();
        const item = items.find((i) => i.id === id);
        if (item) {
          get().updateQuantity(id, item.quantity + 1);
        }
      },

      decrementQuantity: (id) => {
        const { items } = get();
        const item = items.find((i) => i.id === id);
        if (item) {
          get().updateQuantity(id, item.quantity - 1);
        }
      },

      clear: () => {
        set({ items: [], vendorId: null, establishment: null });
      },

      setEstablishment: (establishment) => {
        set({ establishment, vendorId: establishment.id });
      },

      canAddFromEstablishment: (vendorId) => {
        const { vendorId: currentVendorId, items } = get();
        // Can add if cart is empty or same vendor
        return items.length === 0 || currentVendorId === vendorId;
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getDeliveryFee: () => {
        const { establishment } = get();
        return establishment?.delivery_fee ?? 1000;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryFee();
      },
    }),
    {
      name: 'yonima-cart',
      partialize: (state) => ({
        items: state.items,
        vendorId: state.vendorId,
        establishment: state.establishment,
      }),
    }
  )
);

// Selectors for computed values (to avoid re-renders)
export const useCartItems = () => useCartStore((state) => state.items);
export const useCartItemCount = () => useCartStore((state) => state.getTotalItems());
export const useCartSubtotal = () => useCartStore((state) => state.getSubtotal());
export const useCartTotal = () => useCartStore((state) => state.getTotal());
export const useCartEstablishment = () => useCartStore((state) => state.establishment);
