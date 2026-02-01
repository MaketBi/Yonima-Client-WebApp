import { Metadata } from 'next';
import { Suspense } from 'react';
import { getVendorsByType } from '@/actions/catalog';
import { EstablishmentList } from '@/components/establishment/establishment-list';
import { BreadcrumbJsonLd } from '@/components/seo';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Commerces à Dakar - Livraison rapide',
  description: 'Découvrez les commerces de Dakar et faites-vous livrer rapidement vos achats. Yonima livre tout à Dakar.',
  keywords: ['commerces', 'Dakar', 'livraison', 'boutiques', 'shopping', 'achats'],
  openGraph: {
    title: 'Commerces à Dakar - Livraison rapide | Yonima',
    description: 'Découvrez les commerces de Dakar et faites-vous livrer rapidement vos achats.',
    type: 'website',
  },
  alternates: {
    canonical: '/commerces',
  },
};

function CommercesSkeleton() {
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

async function CommercesContent() {
  const commerces = await getVendorsByType('store');

  return (
    <EstablishmentList
      establishments={commerces}
      type="store"
      emptyMessage="Aucun commerce disponible pour le moment. Revenez bientôt !"
    />
  );
}

const breadcrumbs = [
  { name: 'Accueil', url: '/' },
  { name: 'Commerces', url: '/commerces' },
];

export default function CommercesPage() {
  return (
    <div className="container py-6">
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commerces</h1>
        <p className="text-muted-foreground">
          Découvrez les commerces de Dakar et faites-vous livrer
        </p>
      </div>

      <Suspense fallback={<CommercesSkeleton />}>
        <CommercesContent />
      </Suspense>
    </div>
  );
}
