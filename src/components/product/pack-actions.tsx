'use client';

import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/shared/price-display';
import { useCartStore } from '@/stores/cart-store';
import type { Pack, Vendor } from '@/types/models';

interface PackActionsProps {
  pack: Pack;
  vendorId: string;
  vendor?: Vendor;
}

export function PackActions({ pack, vendorId, vendor }: PackActionsProps) {
  const { items, addItem, updateQuantity, removeItem, canAddFromEstablishment } = useCartStore();

  const cartItem = items.find((item) => item.id === pack.id && item.type === 'pack');
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!canAddFromEstablishment(vendorId)) {
      // TODO: Show dialog to clear cart
      return;
    }

    addItem(
      {
        id: pack.id,
        type: 'pack',
        name: pack.name,
        image_url: pack.image_url,
        price: pack.price,
        quantity: 1,
        vendor_id: vendorId,
        establishment_id: vendorId,
      },
      vendor
    );
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(pack.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(pack.id, quantity - 1);
    } else {
      removeItem(pack.id);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 safe-area-bottom">
      <div className="container flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Prix du pack</p>
          <PriceDisplay price={pack.price} className="text-xl font-bold" />
        </div>

        {quantity > 0 ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={handleDecrement}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
              onClick={handleIncrement}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button size="lg" className="px-8" onClick={handleAddToCart}>
            <Plus className="h-5 w-5 mr-2" />
            Ajouter au panier
          </Button>
        )}
      </div>
    </div>
  );
}
