import Link from 'next/link';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { HomeHero } from '@/components/home/home-hero';
import { RestaurantCard } from '@/components/yonima/restaurant-card';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo';
import { ROUTES } from '@/lib/constants';
import { getVendorsByType, getFeaturedVendors, getCuisines } from '@/actions/catalog';
import { formatPrice, isVendorOpen } from '@/lib/utils';

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-3.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2.4/1] w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** "Choisis ta cuisine" — grid of cuisine tags derived from vendors.tags. */
async function CuisineSection() {
  const cuisines = await getCuisines(8);
  if (cuisines.length === 0) return null;

  return (
    <section className="container">
      <div className="relative z-10 -mt-4 rounded-2xl border border-border bg-white p-[18px] shadow-card md:-mt-9 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold tracking-[0.13em] text-ink-muted">
              AUJOURD&apos;HUI J&apos;AI ENVIE DE…
            </div>
            <h2 className="mt-1 text-[22px] font-bold tracking-tight md:text-2xl">
              Choisis ta cuisine
            </h2>
          </div>
          <Link
            href={ROUTES.restaurants}
            className="shrink-0 py-2.5 text-sm font-semibold text-green-forest"
          >
            Tout voir →
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-3.5 md:grid-cols-8 md:gap-4">
          {cuisines.map((cuisine) => (
            <Link
              key={cuisine.label}
              href={`${ROUTES.restaurants}?cuisine=${encodeURIComponent(cuisine.label)}`}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-neutral-200 bg-bg-warm text-2xl md:rounded-xl md:text-4xl">
                {cuisine.emoji}
              </div>
              <div className="text-center text-[11px] font-semibold md:text-sm">
                {cuisine.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** "Pour vous" — horizontal carousel of sponsored/featured restaurants. */
async function FeaturedSection() {
  const featured = await getFeaturedVendors(8);
  const restaurants = featured.filter((v) => v.type === 'restaurant');
  if (restaurants.length === 0) return null;

  return (
    <section>
      <div className="container flex items-center justify-between">
        <h2 className="text-[19px] font-bold tracking-tight">Pour vous</h2>
        <Link href={ROUTES.restaurants} className="text-sm font-semibold text-green-forest">
          Voir tout
        </Link>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-3 px-5 pt-3 pb-2 md:px-8">
          {restaurants.map((vendor) => (
            <RestaurantCard
              key={vendor.id}
              vendor={vendor}
              href={`/restaurants/${vendor.slug || vendor.id}`}
              sponsored
              className="w-[280px] shrink-0"
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
}

/** "Tous les restaurants" — vertical list, open vendors first. */
async function AllRestaurantsSection() {
  const restaurants = await getVendorsByType('restaurant', { limit: 20 });
  if (restaurants.length === 0) return null;

  // Open restaurants first, closed after.
  const sorted = [...restaurants].sort((a, b) => {
    const aOpen = a.is_open && isVendorOpen(a.opening_hours);
    const bOpen = b.is_open && isVendorOpen(b.opening_hours);
    return Number(bOpen) - Number(aOpen);
  });

  return (
    <section className="container">
      <h2 className="text-[19px] font-bold tracking-tight md:text-2xl">
        Tous les restaurants
      </h2>
      <div className="mt-3 grid grid-cols-1 gap-3.5 md:grid-cols-3 md:gap-6">
        {sorted.map((vendor, index) => (
          <RestaurantCard
            key={vendor.id}
            vendor={vendor}
            href={`/restaurants/${vendor.slug || vendor.id}`}
            priority={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="pb-6">
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <HomeHero />

      <div className="space-y-6 pt-0">
        <CuisineSection />

        {/* Épicerie shortcut (kept accessible; grocery is a first-class service) */}
        <section className="container">
          <Link
            href={ROUTES.epicerie}
            className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3.5 shadow-card"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛒</span>
              <div>
                <div className="text-[15px] font-semibold">Épicerie Yonima</div>
                <div className="text-[13px] text-ink-muted">
                  Courses livrées · 10–15 min · {formatPrice(500)}
                </div>
              </div>
            </div>
            <span className="text-green-forest">→</span>
          </Link>
        </section>

        <Suspense fallback={<div className="container"><SectionSkeleton /></div>}>
          <FeaturedSection />
        </Suspense>

        <Suspense fallback={<div className="container"><SectionSkeleton /></div>}>
          <AllRestaurantsSection />
        </Suspense>
      </div>
    </div>
  );
}
