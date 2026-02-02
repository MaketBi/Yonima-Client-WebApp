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

// Icônes épicerie (émojis pour le moment, à remplacer par de vraies icônes)
const groceryIcons = ['🥕', '🛒', '☕', '🥬', '🐟', '🧃'];

function VendorsSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i} className="w-[280px] shrink-0">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VendorCard({ vendor, href, priority = false }: { vendor: Vendor; href: string; priority?: boolean }) {
  return (
    <Link href={href} className="w-[280px] shrink-0">
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="relative aspect-[4/3] bg-muted">
          {priority && vendor.cover_image_url ? (
            <Image
              src={vendor.cover_image_url}
              alt={vendor.name}
              fill
              className="object-cover"
              sizes="280px"
              priority
            />
          ) : (
            <SafeImage
              src={vendor.cover_image_url || ''}
              alt={vendor.name}
              fill
              className="object-cover"
              sizes="280px"
              fallback={<span className="text-4xl">🏪</span>}
              fallbackClassName="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50"
            />
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold line-clamp-1">{vendor.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            {vendor.estimated_time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {vendor.estimated_time}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bike className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
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
      <div className="flex items-center justify-between mb-4">
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
        <div className="flex gap-4 pb-4">
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
      <div className="flex items-center justify-between mb-4">
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
        <div className="flex gap-4 pb-4">
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
      <div className="container py-4 flex items-center justify-between">
        <LocationPickerButton />
      </div>

      <div className="container space-y-8">
        {/* Épicerie Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBasket className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Épicerie</h2>
          </div>
          <Link href={ROUTES.epicerie}>
            <Card className="overflow-hidden border-0 bg-green-50">
              <CardContent className="p-0">
                <div className="relative p-6">
                  {/* Time badge */}
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-xs font-medium px-2 py-1 rounded">
                      10-15 MIN
                    </span>
                  </div>

                  {/* Grocery icons grid */}
                  <div className="flex justify-center py-4">
                    <div className="grid grid-cols-3 gap-6">
                      {groceryIcons.map((icon, index) => (
                        <div
                          key={index}
                          className="h-12 w-12 rounded-full bg-white/80 flex items-center justify-center text-2xl shadow-sm"
                        >
                          {icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom info bar */}
                <div className="bg-white px-4 py-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                    10-15 min
                  </span>
                  <span className="text-muted-foreground" aria-hidden="true">•</span>
                  <span className="flex items-center gap-1">
                    <Bike className="h-4 w-4 text-primary" aria-hidden="true" />
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
