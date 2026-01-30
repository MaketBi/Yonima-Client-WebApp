'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, DeliveryAddress } from '@/types/models';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  deliveryAddress: DeliveryAddress | null;
  savedAddresses: DeliveryAddress[];

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setDeliveryAddress: (address: DeliveryAddress | null) => void;
  setSavedAddresses: (addresses: DeliveryAddress[]) => void;
  addSavedAddress: (address: DeliveryAddress) => void;
  removeSavedAddress: (id: string) => void;
  clear: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      deliveryAddress: null,
      savedAddresses: [],

      setUser: (user) => set({ user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setDeliveryAddress: (deliveryAddress) => set({ deliveryAddress }),

      setSavedAddresses: (savedAddresses) => set({ savedAddresses }),

      addSavedAddress: (address) => {
        const { savedAddresses } = get();
        // Check if already exists
        if (!savedAddresses.find((a) => a.id === address.id)) {
          set({ savedAddresses: [...savedAddresses, address] });
        }
      },

      removeSavedAddress: (id) => {
        const { savedAddresses, deliveryAddress } = get();
        set({
          savedAddresses: savedAddresses.filter((a) => a.id !== id),
          // Clear current address if it was the deleted one
          deliveryAddress: deliveryAddress?.id === id ? null : deliveryAddress,
        });
      },

      clear: () => {
        set({
          user: null,
          isLoading: false,
          deliveryAddress: null,
          savedAddresses: [],
        });
      },
    }),
    {
      name: 'yonima-user',
      partialize: (state) => ({
        deliveryAddress: state.deliveryAddress,
        savedAddresses: state.savedAddresses,
      }),
    }
  )
);

// Selectors
export const useUser = () => useUserStore((state) => state.user);
export const useUserLoading = () => useUserStore((state) => state.isLoading);
export const useDeliveryAddress = () => useUserStore((state) => state.deliveryAddress);
export const useSavedAddresses = () => useUserStore((state) => state.savedAddresses);
