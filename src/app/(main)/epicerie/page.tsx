import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, ShoppingCart } from 'lucide-react';
import { getGroceryCategories } from '@/actions/catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeImage } from '@/components/shared/safe-image';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Épicerie en ligne',
  description: 'Faites vos courses en ligne et recevez-les rapidement à Dakar.',
};

function CategoriesSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[...Array(12)].map((_, i) => (
        <div key={i}>
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
        </div>
      ))}
    </div>
  );
}

async function GroceryCategoriesContent() {
  const { categories, vendorId } = await getGroceryCategories();

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucune catégorie disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/epicerie/${category.id}`}
          className="group"
        >
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <SafeImage
              src={category.image_url || ''}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 33vw, 200px"
              fallback={<span className="text-3xl">🛒</span>}
              fallbackClassName="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50"
            />
          </div>
          <p className="text-sm font-medium text-center mt-2 line-clamp-2">
            {category.name}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default function EpiceriePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">Épicerie en ligne</h1>
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href={ROUTES.panier}>
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10 bg-muted/50 border-0"
          />
        </div>

        {/* Categories Grid */}
        <Suspense fallback={<CategoriesSkeleton />}>
          <GroceryCategoriesContent />
        </Suspense>
      </div>
    </div>
  );
}
