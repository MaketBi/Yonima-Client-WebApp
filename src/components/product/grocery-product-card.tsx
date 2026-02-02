'use client';

import { Plus, Minus, ShoppingBasket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SafeImage } from '@/components/shared/safe-image';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useCart } from '@/providers/cart-provider';
import type { Product, Vendor } from '@/types/models';

interface GroceryProductCardProps {
  product: Product;
  vendorId: string;
  vendor?: Vendor;
}

export function GroceryProductCard({ product, vendorId, vendor }: GroceryProductCardProps) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const { addToCart } = useCart();

  const cartItem = items.find((item) => item.id === product.id && item.type === 'product');
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(
      {
        id: product.id,
        type: 'product',
        name: product.name,
        image_url: product.image_url,
        price: product.price,
        quantity: 1,
        vendor_id: vendorId,
        establishment_id: vendorId,
      },
      vendor
    );
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const isAvailable = product.is_available && product.is_active;

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-white">
      <div className="p-2">
        {/* Image with + button */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
          <SafeImage
            src={product.image_url || ''}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 33vw, 150px"
            fallback={<ShoppingBasket className="h-8 w-8 text-gray-300" />}
            fallbackClassName="absolute inset-0"
          />

          {/* Add button */}
          {isAvailable && (
            <div className="absolute bottom-2 right-2">
              {quantity > 0 ? (
                <div className="flex items-center gap-1 bg-white rounded-full shadow-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full hover:bg-gray-100"
                    onClick={handleDecrement}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-5 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full bg-primary text-white hover:bg-primary/90"
                    onClick={handleIncrement}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 shadow-md"
                  onClick={handleAddToCart}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Unavailable overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-medium">Indisponible</span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="mt-2">
          <p className="text-primary font-semibold text-sm">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {product.name}
          </p>
        </div>
      </div>
    </Card>
  );
}
