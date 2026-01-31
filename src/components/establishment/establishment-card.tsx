'use client';

import Link from 'next/link';
import { Star, Clock, MapPin, Bike } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SafeImage } from '@/components/shared/safe-image';
import { cn, formatPrice, isVendorOpen } from '@/lib/utils';
import type { Vendor } from '@/types/models';

interface EstablishmentCardProps {
  establishment: Vendor;
  href: string;
  className?: string;
}

export function EstablishmentCard({ establishment, href, className }: EstablishmentCardProps) {
  const isOpen = establishment.is_open && isVendorOpen(establishment.opening_hours);

  return (
    <Link href={href}>
      <Card className={cn('overflow-hidden hover:shadow-md transition-shadow', className)}>
        {/* Image */}
        <div className="relative aspect-[16/10] bg-muted">
          <SafeImage
            src={establishment.cover_image_url || ''}
            alt={establishment.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fallback={<span className="text-4xl">🏪</span>}
            fallbackClassName="absolute inset-0"
          />

          {/* Closed overlay */}
          {!isOpen && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Fermé
              </Badge>
            </div>
          )}

          {/* Logo */}
          {establishment.logo_url && (
            <div className="absolute bottom-2 right-2 h-12 w-12 rounded-full bg-white p-1 shadow-md overflow-hidden">
              <SafeImage
                src={establishment.logo_url}
                alt={`Logo ${establishment.name}`}
                fill
                className="rounded-full object-cover"
                fallback={<span className="text-lg">🏪</span>}
              />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Name and rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1">{establishment.name}</h3>
            {establishment.rating && (
              <div className="flex items-center gap-1 shrink-0">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{establishment.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {establishment.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {establishment.description}
            </p>
          )}

          {/* Tags */}
          {establishment.tags && establishment.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {establishment.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Info row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {establishment.estimated_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{establishment.estimated_time}</span>
              </div>
            )}
            {establishment.neighborhood && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{establishment.neighborhood}</span>
              </div>
            )}
          </div>

          {/* Delivery info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 text-sm">
              <Bike className="h-4 w-4 text-primary" />
              <span>
                {establishment.delivery_fee > 0
                  ? formatPrice(establishment.delivery_fee)
                  : 'Livraison gratuite'}
              </span>
            </div>
            {establishment.min_order > 0 && (
              <span className="text-xs text-muted-foreground">
                Min. {formatPrice(establishment.min_order)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
