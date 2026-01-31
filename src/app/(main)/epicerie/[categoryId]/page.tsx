import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getGroceryProductsByCategory, getVendor, getVendorProducts, getVendorCategories } from '@/actions/catalog';
import { ProductList } from '@/components/product/product-list';
import { EstablishmentHeader } from '@/components/establishment/establishment-header';
import { CategoryNav } from '@/components/product/category-nav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Props {
  params: Promise<{ categoryId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const decodedName = decodeURIComponent(categoryId);

  // Check if it's a vendor slug or a category name
  const vendor = await getVendor(categoryId);

  if (vendor) {
    return {
      title: vendor.name,
      description: vendor.description || `Commandez chez ${vendor.name} sur Yonima`,
    };
  }

  // It's a category name
  const capitalizedName = decodedName.charAt(0).toUpperCase() + decodedName.slice(1);

  return {
    title: `${capitalizedName} - Épicerie`,
    description: `Découvrez notre sélection de ${decodedName} et faites-vous livrer rapidement.`,
  };
}

function ProductsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-3 rounded-lg overflow-hidden border">
          <Skeleton className="w-28 h-28" />
          <div className="flex-1 p-3 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function GroceryContent({ categoryId }: { categoryId: string }) {
  const decodedName = decodeURIComponent(categoryId);

  // First check if it's a vendor slug/id
  const vendor = await getVendor(categoryId);

  if (vendor) {
    // It's a vendor - show vendor page
    const [categories, products] = await Promise.all([
      getVendorCategories(vendor.id),
      getVendorProducts(vendor.id),
    ]);

    return (
      <div>
        <EstablishmentHeader establishment={vendor} />
        {categories.length > 0 && <CategoryNav categories={categories} />}
        <div className="container py-4">
          <ProductList
            products={products}
            categories={categories}
            vendorId={vendor.id}
            emptyMessage="Aucun produit disponible pour le moment."
          />
        </div>
      </div>
    );
  }

  // It's a category name - show products from all grocery vendors
  const products = await getGroceryProductsByCategory(decodedName);
  const capitalizedName = decodedName.charAt(0).toUpperCase() + decodedName.slice(1);

  return (
    <div className="container py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/epicerie">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{capitalizedName}</h1>
          <p className="text-muted-foreground">
            {products.length} produit{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => {
            const vendorInfo = (product as any).vendor;
            return (
              <div key={product.id} className="relative">
                {vendorInfo && (
                  <div className="absolute top-2 right-2 z-10 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                    {vendorInfo.name}
                  </div>
                )}
                <ProductList
                  products={[product]}
                  vendorId={product.vendor_id}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun produit dans cette catégorie pour le moment.</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/epicerie">Retour aux catégories</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default async function GroceryCategoryPage({ params }: Props) {
  const { categoryId } = await params;

  return (
    <Suspense
      fallback={
        <div className="container py-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <ProductsSkeleton />
        </div>
      }
    >
      <GroceryContent categoryId={categoryId} />
    </Suspense>
  );
}
