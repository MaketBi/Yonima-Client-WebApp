import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getGroceryCategories, getVendorsByType } from '@/actions/catalog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { ShoppingBasket } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Épicerie',
  description: 'Faites vos courses en ligne et recevez-les rapidement à Dakar.',
};

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <div className="p-3">
            <Skeleton className="h-5 w-3/4 mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface CategoryCardProps {
  name: string;
  imageUrl?: string | null;
  href: string;
}

function CategoryCard({ name, imageUrl, href }: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-square bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-green-50">
              <ShoppingBasket className="h-12 w-12 text-green-600/50" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium text-center line-clamp-1">{name}</h3>
        </CardContent>
      </Card>
    </Link>
  );
}

async function GroceryCategoriesContent() {
  const categories = await getGroceryCategories();

  if (categories.length === 0) {
    // Fallback: show grocery vendors instead
    const groceryVendors = await getVendorsByType('grocery');

    if (groceryVendors.length === 0) {
      return (
        <EmptyState
          icon={ShoppingBasket}
          title="Épicerie bientôt disponible"
          description="Notre service d'épicerie sera bientôt disponible. Revenez nous voir !"
        />
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {groceryVendors.map((vendor) => (
          <CategoryCard
            key={vendor.id}
            name={vendor.name}
            imageUrl={vendor.logo_url}
            href={`/epicerie/${vendor.slug || vendor.id}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          name={category.name}
          imageUrl={category.image_url}
          href={`/epicerie/${encodeURIComponent(category.name.toLowerCase())}`}
        />
      ))}
    </div>
  );
}

export default function EpiceriePage() {
  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Épicerie</h1>
        <p className="text-muted-foreground">
          Faites vos courses en ligne et recevez-les rapidement
        </p>
      </div>

      <Suspense fallback={<CategoriesSkeleton />}>
        <GroceryCategoriesContent />
      </Suspense>
    </div>
  );
}
