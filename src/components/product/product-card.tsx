'use client';

import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/shared/price-display';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useCart } from '@/providers/cart-provider';
import type { Product, Vendor } from '@/types/models';

interface ProductCardProps {
  product: Product;
  vendorId: string;
  vendor?: Vendor;
  onClick?: () => void;
  className?: string;
}

export function ProductCard({ product, vendorId, vendor, onClick, className }: ProductCardProps) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const { addToCart } = useCart();

  const cartItem = items.find((item) => item.id === product.id && item.type === 'product');
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
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
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const isAvailable = product.is_available && product.is_active;

  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer hover:shadow-md transition-shadow',
        !isAvailable && 'opacity-60',
        className
      )}
      onClick={onClick}
    >
      <div className="flex">
        {/* Image */}
        <div className="relative w-28 h-28 shrink-0 bg-muted">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="112px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
          )}

          {!isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs">
                Indisponible
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-medium line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <PriceDisplay price={product.price} className="font-semibold" />

            {isAvailable && (
              <div className="flex items-center gap-1">
                {quantity > 0 ? (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleDecrement}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleIncrement}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8"
                    onClick={handleAddToCart}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
