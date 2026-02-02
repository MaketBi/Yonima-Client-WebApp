'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useDeliveryAddressStore } from '@/stores/delivery-address-store';
import { AddressPickerScreen } from '@/components/checkout/address-picker-screen';

export function LocationPickerButton() {
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const deliveryAddress = useDeliveryAddressStore();

  // Note: Geolocation is only requested when user opens the address picker,
  // not automatically on page load. This improves Best Practices score.

  // Get display text
  const getDisplayLocation = () => {
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
        aria-label={`Adresse de livraison: ${getDisplayLocation()}. Cliquez pour modifier.`}
      >
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <span className="font-medium max-w-[200px] truncate">{getDisplayLocation()}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>

      <AddressPickerScreen
        open={isAddressPickerOpen}
        onOpenChange={setIsAddressPickerOpen}
      />
    </>
  );
}
