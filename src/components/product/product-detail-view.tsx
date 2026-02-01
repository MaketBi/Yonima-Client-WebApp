'use client';

import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { CURRENCY } from '@/lib/constants';
import type { Product, Vendor } from '@/types/models';

interface ProductDetailViewProps {
  product: Product;
  vendor: Vendor;
}

export function ProductDetailView({ product, vendor }: ProductDetailViewProps) {
  const { items, addItem, updateQuantity, removeItem, canAddFromEstablishment } = useCartStore();

  const cartItem = items.find((item) => item.id === product.id && item.type === 'product');
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!canAddFromEstablishment(vendor.id)) {
      return;
    }

    addItem(
      {
        id: product.id,
        type: 'product',
        name: product.name,
        image_url: product.image_url,
        price: product.price,
        quantity: 1,
        vendor_id: vendor.id,
        establishment_id: vendor.id,
      },
      vendor
    );
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const isAvailable = product.is_available && product.is_active;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} ${CURRENCY}`;
  };

  return (
    <div className="bg-background rounded-t-3xl -mt-6 relative z-10">
      <div className="p-4 space-y-4">
        {/* Product Name */}
        <div>
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="text-primary font-semibold text-lg mt-1">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h2 className="font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground text-sm">{product.description}</p>
          </div>
        )}

        {/* Unavailable Badge */}
        {!isAvailable && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-center">
            Ce produit n&apos;est pas disponible actuellement
          </div>
        )}

        {/* Add to Cart */}
        {isAvailable && (
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
                Ajouter au panier - {formatPrice(product.price)}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
