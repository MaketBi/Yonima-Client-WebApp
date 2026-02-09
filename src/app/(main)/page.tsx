import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { ChevronRight, Clock, Bike, ShoppingBasket, Utensils, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { SafeImage } from '@/components/shared/safe-image';
import { LocationPickerButton } from '@/components/shared/location-picker-button';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo';
import { ROUTES } from '@/lib/constants';
import { getVendorsByType } from '@/actions/catalog';
import { formatPrice } from '@/lib/utils';
import type { Vendor } from '@/types/models';

function VendorsSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-[65vw] md:w-[280px] shrink-0">
          <Skeleton className="aspect-[2/1] w-full rounded-xl" />
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VendorCard({ vendor, href, priority = false }: { vendor: Vendor; href: string; priority?: boolean }) {
  return (
    <Link href={href} className="w-[65vw] md:w-[280px] shrink-0">
      <Card className="overflow-hidden border-0 shadow-sm rounded-xl">
        <div className="relative aspect-[2/1] bg-muted">
          {priority && vendor.cover_image_url ? (
            <Image
              src={vendor.cover_image_url}
              alt={vendor.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 65vw, 280px"
              priority
            />
          ) : (
            <SafeImage
              src={vendor.cover_image_url || ''}
              alt={vendor.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 65vw, 280px"
              fallback={<span className="text-4xl">🏪</span>}
              fallbackClassName="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50"
            />
          )}
        </div>
        <CardContent className="p-2.5">
          <h3 className="font-semibold text-sm line-clamp-1">{vendor.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            {vendor.estimated_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" aria-hidden="true" />
                {vendor.estimated_time}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bike className="h-3 w-3 text-primary" aria-hidden="true" />
              {vendor.delivery_fee > 0 ? formatPrice(vendor.delivery_fee) : 'Gratuit'}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

async function RestaurantsSection() {
  const restaurants = await getVendorsByType('restaurant', { limit: 10 });

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Restaurants</h2>
        </div>
        <Button variant="outline" size="icon" className="rounded-full h-9 w-9" asChild>
          <Link href={ROUTES.restaurants} aria-label="Voir tous les restaurants">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {restaurants.map((vendor, index) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              href={`/restaurants/${vendor.slug || vendor.id}`}
              priority={index === 0}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

async function CommercesSection() {
  const commerces = await getVendorsByType('store', { limit: 10 });

  if (commerces.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-semibold">Commerces</h2>
        </div>
        <Button variant="outline" size="icon" className="rounded-full h-9 w-9" asChild>
          <Link href={ROUTES.commerces} aria-label="Voir tous les commerces">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-3">
          {commerces.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              href={`/commerces/${vendor.slug || vendor.id}`}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="pb-6">
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      {/* Location Header - Mobile style */}
      <div className="container py-3 flex items-center justify-between">
        <LocationPickerButton />
      </div>

      <div className="container space-y-5">
        {/* Épicerie Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBasket className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Épicerie</h2>
          </div>
          <Link href={ROUTES.epicerie}>
            <Card className="overflow-hidden border-0 rounded-xl">
              <CardContent className="p-0">
                <div className="relative aspect-[3/1]">
                  <Image
                    src="/Affiche1080x540.png"
                    alt="Épicerie Yonima"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 720px"
                    priority
                  />
                </div>

                {/* Bottom info bar */}
                <div className="px-3 py-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    10-15 min
                  </span>
                  <span className="text-muted-foreground" aria-hidden="true">•</span>
                  <span className="flex items-center gap-1">
                    <Bike className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    500F
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* Restaurants Section */}
        <Suspense fallback={<VendorsSkeleton />}>
          <RestaurantsSection />
        </Suspense>

        {/* Commerces Section */}
        <Suspense fallback={<VendorsSkeleton />}>
          <CommercesSection />
        </Suspense>
      </div>
    </div>
  );
}
