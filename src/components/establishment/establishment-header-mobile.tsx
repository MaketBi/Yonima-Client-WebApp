'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartItemCount } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import type { Vendor } from '@/types/models';

interface EstablishmentHeaderMobileProps {
  establishment: Vendor;
}

export function EstablishmentHeaderMobile({ establishment }: EstablishmentHeaderMobileProps) {
  const router = useRouter();
  const cartItemCount = useCartItemCount();

  return (
    <div className="sticky top-0 z-50 bg-background border-b">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full shrink-0"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="relative h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
          {establishment.logo_url ? (
            <Image
              src={establishment.logo_url}
              alt={establishment.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">🏪</span>
            </div>
          )}
        </div>

        {/* Name and Info */}
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base truncate">{establishment.name}</h1>
          <p className="text-xs text-muted-foreground">
            {establishment.estimated_time || '20-30 min'} • {formatPrice(establishment.delivery_fee)}
          </p>
        </div>

        {/* Cart Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full shrink-0 relative"
          asChild
        >
          <Link href="/panier">
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </Badge>
            )}
          </Link>
        </Button>
      </div>
    </div>
  );
}
