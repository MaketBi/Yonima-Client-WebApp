import { Metadata } from 'next';
import { Suspense } from 'react';
import { getVendorsByType } from '@/actions/catalog';
import { EstablishmentList } from '@/components/establishment/establishment-list';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Restaurants',
  description: 'Découvrez les meilleurs restaurants de Dakar et commandez vos plats préférés.',
};

function RestaurantsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <Skeleton className="aspect-[16/10] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function RestaurantsContent() {
  const restaurants = await getVendorsByType('restaurant');

  return (
    <EstablishmentList
      establishments={restaurants}
      type="restaurant"
      emptyMessage="Aucun restaurant disponible pour le moment. Revenez bientôt !"
    />
  );
}

export default function RestaurantsPage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <p className="text-muted-foreground">
          Découvrez les meilleurs restaurants de Dakar
        </p>
      </div>

      <Suspense fallback={<RestaurantsSkeleton />}>
        <RestaurantsContent />
      </Suspense>
    </div>
  );
}
