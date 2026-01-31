'use client';

import Image from 'next/image';
import { Star, Clock, MapPin, Phone, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatPrice, isVendorOpen } from '@/lib/utils';
import type { Vendor } from '@/types/models';

interface EstablishmentHeaderProps {
  establishment: Vendor;
  className?: string;
}

export function EstablishmentHeader({ establishment, className }: EstablishmentHeaderProps) {
  const router = useRouter();
  const isOpen = establishment.is_open && isVendorOpen(establishment.opening_hours);

  return (
    <div className={cn('relative', className)}>
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 bg-muted">
        {establishment.cover_image_url ? (
          <Image
            src={establishment.cover_image_url}
            alt={establishment.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-6xl">🏪</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/90 hover:bg-white"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {/* Status badge */}
        <div className="absolute top-4 right-4">
          <Badge variant={isOpen ? 'default' : 'destructive'}>
            {isOpen ? 'Ouvert' : 'Fermé'}
          </Badge>
        </div>
      </div>

      {/* Info section */}
      <div className="relative px-4 pb-4 -mt-16">
        <div className="flex items-end gap-4">
          {/* Logo */}
          <div className="relative h-24 w-24 rounded-xl bg-white shadow-lg overflow-hidden shrink-0">
            {establishment.logo_url ? (
              <Image
                src={establishment.logo_url}
                alt={`Logo ${establishment.name}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <span className="text-3xl">🏪</span>
              </div>
            )}
          </div>

          {/* Name */}
          <div className="flex-1 pb-2">
            <h1 className="text-xl font-bold">{establishment.name}</h1>
          </div>
        </div>

        {/* Description */}
        {establishment.description && (
          <p className="text-muted-foreground mt-3">{establishment.description}</p>
        )}

        {/* Tags */}
        {establishment.tags && establishment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {establishment.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {/* Rating */}
          {establishment.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-100">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold">{establishment.rating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">
                  {establishment.review_count} avis
                </p>
              </div>
            </div>
          )}

          {/* Delivery time */}
          {establishment.estimated_time && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">{establishment.estimated_time}</p>
                <p className="text-xs text-muted-foreground">Livraison</p>
              </div>
            </div>
          )}

          {/* Location */}
          {establishment.neighborhood && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold line-clamp-1">{establishment.neighborhood}</p>
                <p className="text-xs text-muted-foreground">{establishment.city || 'Dakar'}</p>
              </div>
            </div>
          )}

          {/* Delivery fee */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <span className="text-lg">🚴</span>
            </div>
            <div>
              <p className="font-semibold">
                {establishment.delivery_fee > 0
                  ? formatPrice(establishment.delivery_fee)
                  : 'Gratuit'}
              </p>
              <p className="text-xs text-muted-foreground">
                Min. {formatPrice(establishment.min_order)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
          <span>Paiement :</span>
          {establishment.accepts_cash && <Badge variant="outline">Espèces</Badge>}
          {establishment.accepts_card && <Badge variant="outline">Carte</Badge>}
          <Badge variant="outline">Wave</Badge>
          <Badge variant="outline">Orange Money</Badge>
        </div>
      </div>
    </div>
  );
}
