import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Search, ShoppingCart } from 'lucide-react';
import { getCategory, getGroceryProductsByCategory, getGroceryVendor } from '@/actions/catalog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { GroceryProductCard } from '@/components/product/grocery-product-card';
import { ROUTES } from '@/lib/constants';

interface Props {
  params: Promise<{ categoryId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await getCategory(categoryId);

  if (!category) {
    return {
      title: 'Catégorie non trouvée',
    };
  }

  return {
    title: `${category.name} - Épicerie`,
    description: `Découvrez notre sélection de ${category.name} et faites-vous livrer rapidement.`,
  };
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-1/2 mt-2" />
          <Skeleton className="h-3 w-3/4 mt-1" />
        </div>
      ))}
    </div>
  );
}

async function CategoryProductsContent({ categoryId }: { categoryId: string }) {
  const [category, products, vendor] = await Promise.all([
    getCategory(categoryId),
    getGroceryProductsByCategory(categoryId),
    getGroceryVendor(),
  ]);

  if (!category) {
    notFound();
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun produit dans cette catégorie pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {products.map((product) => (
        <GroceryProductCard
          key={product.id}
          product={product}
          vendorId={vendor?.id || product.vendor_id}
        />
      ))}
    </div>
  );
}

export default async function GroceryCategoryPage({ params }: Props) {
  const { categoryId } = await params;
  const category = await getCategory(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/epicerie">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">{category.name}</h1>
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
            placeholder={`Rechercher dans ${category.name}...`}
            className="pl-10 bg-white border-0"
          />
        </div>

        {/* Products Grid */}
        <Suspense fallback={<ProductsSkeleton />}>
          <CategoryProductsContent categoryId={categoryId} />
        </Suspense>
      </div>
    </div>
  );
}
