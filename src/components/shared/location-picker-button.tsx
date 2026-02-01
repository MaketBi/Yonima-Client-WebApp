'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { useDeliveryAddressStore } from '@/stores/delivery-address-store';
import { AddressPickerScreen } from '@/components/checkout/address-picker-screen';
import { checkDeliveryZoneCoverage } from '@/actions/neighborhoods';

export function LocationPickerButton() {
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [hasAttemptedLocation, setHasAttemptedLocation] = useState(false);
  const deliveryAddress = useDeliveryAddressStore();

  // Check zone coverage and update store
  const checkAndUpdateZone = useCallback(async (lat: number, lng: number, address: string) => {
    const result = await checkDeliveryZoneCoverage(lat, lng);

    if (result.isCovered && result.nearestNeighborhood) {
      deliveryAddress.setAddress({
        formattedAddress: address,
        city: result.nearestNeighborhood.city,
        neighborhood: result.nearestNeighborhood.name,
        latitude: lat,
        longitude: lng,
        isZoneCovered: true,
      });
    } else {
      // Even if not covered, store the address
      deliveryAddress.setAddress({
        formattedAddress: address,
        latitude: lat,
        longitude: lng,
        isZoneCovered: false,
      });
    }
  }, [deliveryAddress]);

  // Request location on mount if no address is manually set
  useEffect(() => {
    // Only attempt once and if no address has been manually set by user
    if (hasAttemptedLocation || deliveryAddress.isManuallySet) {
      return;
    }

    setHasAttemptedLocation(true);

    // Check if geolocation is available
    if (!navigator.geolocation) {
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocoding using Nominatim
        let address = '';
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
          );
          const data = await response.json();

          // Simplify address for display
          if (data.address) {
            const parts = [];
            if (data.address.road) parts.push(data.address.road);
            if (data.address.suburb) parts.push(data.address.suburb);
            if (data.address.city || data.address.town) {
              parts.push(data.address.city || data.address.town);
            }
            if (parts.length > 0) {
              address = parts.join(', ');
            }
          }
          if (!address) {
            address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }
        } catch {
          address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        // Check zone and update store
        await checkAndUpdateZone(latitude, longitude, address);
        setIsLocating(false);
      },
      () => {
        // Error or permission denied - just stop loading
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [hasAttemptedLocation, deliveryAddress, checkAndUpdateZone]);

  // Get display text
  const getDisplayLocation = () => {
    if (isLocating) {
      return 'Localisation...';
    }
    if (deliveryAddress.neighborhood) {
      return deliveryAddress.neighborhood;
    }
    if (deliveryAddress.city) {
      return deliveryAddress.city;
    }
    if (deliveryAddress.formattedAddress) {
      return deliveryAddress.formattedAddress;
    }
    return 'Sélectionner une adresse';
  };

  return (
    <>
      <button
        onClick={() => setIsAddressPickerOpen(true)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 -ml-2 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          {isLocating ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 text-primary" />
          )}
        </div>
        <span className="font-medium max-w-[200px] truncate">{getDisplayLocation()}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      <AddressPickerScreen
        open={isAddressPickerOpen}
        onOpenChange={setIsAddressPickerOpen}
      />
    </>
  );
}
