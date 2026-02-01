'use client';

import { Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { CURRENCY } from '@/lib/constants';
import type { Pack, Vendor } from '@/types/models';

interface PackDetailViewProps {
  pack: Pack;
  vendor: Vendor;
}

export function PackDetailView({ pack, vendor }: PackDetailViewProps) {
  const { items, addItem, updateQuantity, removeItem, canAddFromEstablishment } = useCartStore();

  const cartItem = items.find((item) => item.id === pack.id && item.type === 'pack');
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!canAddFromEstablishment(vendor.id)) {
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
        vendor_id: vendor.id,
        establishment_id: vendor.id,
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

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} ${CURRENCY}`;
  };

  return (
    <div className="bg-background rounded-t-3xl -mt-6 relative z-10">
      <div className="p-4 space-y-4">
        {/* Pack Name */}
        <div>
          <h1 className="text-xl font-bold">{pack.name}</h1>
          <p className="text-primary font-semibold text-lg mt-1">
            {formatPrice(pack.price)}
          </p>
        </div>

        {/* Description */}
        {pack.description && (
          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground text-sm">{pack.description}</p>
          </div>
        )}

        {/* Pack Items */}
        {pack.pack_items && pack.pack_items.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3">Contenu du pack ({pack.pack_items.length} articles)</h2>
            <div className="space-y-2">
              {pack.pack_items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add to Cart */}
        <div className="pt-4 border-t">
          {quantity > 0 ? (
            <div className="flex items-center justify-between">
              <span className="font-medium">Quantité dans le panier</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleDecrement}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={handleIncrement}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              className="w-full h-12 text-base"
              onClick={handleAddToCart}
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter au panier - {formatPrice(pack.price)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
