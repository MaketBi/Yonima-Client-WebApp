'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceDisplay } from '@/components/shared/price-display';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import type { Pack, Vendor } from '@/types/models';

interface PackCardProps {
  pack: Pack;
  vendorId: string;
  vendor?: Vendor;
  showVendor?: boolean;
  className?: string;
}

export function PackCard({ pack, vendorId, vendor, showVendor, className }: PackCardProps) {
  const { items, addItem, updateQuantity, removeItem, canAddFromEstablishment } = useCartStore();

  const cartItem = items.find((item) => item.id === pack.id && item.type === 'pack');
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(pack.id, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) {
      updateQuantity(pack.id, quantity - 1);
    } else {
      removeItem(pack.id);
    }
  };

  return (
    <Link href={`/pack/${pack.id}`}>
      <Card className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}>
        {/* Image */}
        <div className="relative aspect-[16/9] bg-muted">
          {pack.image_url ? (
            <Image
              src={pack.image_url}
              alt={pack.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Package className="h-12 w-12 text-primary/50" />
            </div>
          )}

          {/* Badge */}
          {pack.order_count && pack.order_count > 10 && (
            <Badge className="absolute top-2 left-2 bg-orange-500">
              Populaire
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          {/* Name */}
          <h3 className="font-semibold line-clamp-1">{pack.name}</h3>

          {/* Description */}
          {pack.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {pack.description}
            </p>
          )}

          {/* Pack items preview */}
          {pack.pack_items && pack.pack_items.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {pack.pack_items.length} articles :{' '}
                {pack.pack_items
                  .slice(0, 3)
                  .map((item) => item.name)
                  .join(', ')}
                {pack.pack_items.length > 3 && '...'}
              </p>
            </div>
          )}

          {/* Price and actions */}
          <div className="flex items-center justify-between mt-3">
            <PriceDisplay price={pack.price} className="font-semibold text-lg" />

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
                <Button variant="default" size="sm" onClick={handleAddToCart}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
