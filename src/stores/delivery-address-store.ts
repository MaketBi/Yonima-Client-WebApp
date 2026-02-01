'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeliveryAddressState {
  formattedAddress: string;
  city: string;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  additionalInfo: string;
  isZoneCovered: boolean;
  isManuallySet: boolean; // True if user manually selected an address
}

interface DeliveryAddressStore extends DeliveryAddressState {
  // Actions
  setAddress: (address: Partial<DeliveryAddressState>) => void;
  setFormattedAddress: (formattedAddress: string) => void;
  setCity: (city: string) => void;
  setNeighborhood: (neighborhood: string) => void;
  setCoordinates: (latitude: number, longitude: number) => void;
  setAdditionalInfo: (additionalInfo: string) => void;
  setIsZoneCovered: (isZoneCovered: boolean) => void;
  clear: () => void;

  // Getters
  hasAddress: () => boolean;
  getFullAddress: () => string;
}

const initialState: DeliveryAddressState = {
  formattedAddress: '',
  city: '',
  neighborhood: '',
  latitude: null,
  longitude: null,
  additionalInfo: '',
  isZoneCovered: true,
  isManuallySet: false,
};

export const useDeliveryAddressStore = create<DeliveryAddressStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAddress: (address) => {
        set((state) => ({ ...state, ...address }));
      },

      setFormattedAddress: (formattedAddress) => {
        set({ formattedAddress });
      },

      setCity: (city) => {
        // Reset neighborhood when city changes
        set({ city, neighborhood: '' });
      },

      setNeighborhood: (neighborhood) => {
        set({ neighborhood });
      },

      setCoordinates: (latitude, longitude) => {
        set({ latitude, longitude });
      },

      setAdditionalInfo: (additionalInfo) => {
        set({ additionalInfo });
      },

      setIsZoneCovered: (isZoneCovered) => {
        set({ isZoneCovered });
      },

      clear: () => {
        set(initialState);
      },

      hasAddress: () => {
        const { formattedAddress, city, neighborhood } = get();
        return !!(formattedAddress || (city && neighborhood));
      },

      getFullAddress: () => {
        const { formattedAddress, city, neighborhood } = get();

        // Priority: neighborhood + city if manually selected, then formattedAddress
        // Note: additionalInfo is NOT included here - it's sent separately as delivery note
        if (city && neighborhood) {
          return `${neighborhood}, ${city}`;
        }

        if (formattedAddress) {
          return formattedAddress;
        }

        return '';
      },
    }),
    {
      name: 'yonima-delivery-address',
      partialize: (state) => ({
        formattedAddress: state.formattedAddress,
        city: state.city,
        neighborhood: state.neighborhood,
        latitude: state.latitude,
        longitude: state.longitude,
        additionalInfo: state.additionalInfo,
        isZoneCovered: state.isZoneCovered,
        isManuallySet: state.isManuallySet,
      }),
    }
  )
);

// Selectors
export const useDeliveryAddress = () => useDeliveryAddressStore((state) => ({
  formattedAddress: state.formattedAddress,
  city: state.city,
  neighborhood: state.neighborhood,
  latitude: state.latitude,
  longitude: state.longitude,
  additionalInfo: state.additionalInfo,
  isZoneCovered: state.isZoneCovered,
  isManuallySet: state.isManuallySet,
}));

export const useHasDeliveryAddress = () => useDeliveryAddressStore((state) => state.hasAddress());
