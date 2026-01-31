'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, DeliveryAddress } from '@/types/models';

interface UserStore {
  user: User | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  deliveryAddress: DeliveryAddress | null;
  savedAddresses: DeliveryAddress[];

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
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
      _hasHydrated: false,
      deliveryAddress: null,
      savedAddresses: [],

      setUser: (user) => set({ user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),

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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        deliveryAddress: state.deliveryAddress,
        savedAddresses: state.savedAddresses,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // If user was restored from storage, stop loading immediately
          if (state.user) {
            state.setLoading(false);
          }
        }
      },
    }
  )
);

// Selectors
export const useUser = () => useUserStore((state) => state.user);
export const useUserLoading = () => useUserStore((state) => state.isLoading);
export const useDeliveryAddress = () => useUserStore((state) => state.deliveryAddress);
export const useSavedAddresses = () => useUserStore((state) => state.savedAddresses);
