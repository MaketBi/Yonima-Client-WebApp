'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { CURRENCY } from '@/lib/constants';
import type { Product, Vendor } from '@/types/models';

interface ProductCardGridProps {
  product: Product;
  vendorId: string;
  vendor?: Vendor;
  onClick?: () => void;
  className?: string;
}

export function ProductCardGrid({ product, vendorId, vendor, onClick, className }: ProductCardGridProps) {
  const { items, addItem, canAddFromEstablishment } = useCartStore();

  const cartItem = items.find((item) => item.id === product.id && item.type === 'product');
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!canAddFromEstablishment(vendorId)) {
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
        vendor_id: vendorId,
        establishment_id: vendorId,
      },
      vendor
    );
  };

  const isAvailable = product.is_available && product.is_active;

  const formatPriceLocal = (price: number) => {
    return `${price.toLocaleString('fr-FR')} F ${CURRENCY}`;
  };

  return (
    <div
      className={cn(
        'cursor-pointer group',
        !isAvailable && 'opacity-60',
        className
      )}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-2">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Add Button */}
        {isAvailable && (
          <Button
            size="icon"
            className={cn(
              'absolute bottom-2 right-2 h-9 w-9 rounded-full shadow-lg',
              quantity > 0 ? 'bg-primary' : 'bg-white text-primary hover:bg-white/90'
            )}
            onClick={handleAddToCart}
          >
            {quantity > 0 ? (
              <span className="text-sm font-bold">{quantity}</span>
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>
        )}

        {/* Unavailable overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-medium bg-black/60 px-3 py-1 rounded-full">
              Indisponible
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
      <p className="text-primary font-semibold text-sm mt-0.5">
        {formatPriceLocal(product.price)}
      </p>
    </div>
  );
}
