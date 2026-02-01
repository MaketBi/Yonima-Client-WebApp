import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getVendor, getVendorCategories, getVendorProducts, getVendorPacks } from '@/actions/catalog';
import { EstablishmentHeaderMobile } from '@/components/establishment/establishment-header-mobile';
import { CategoryTabs } from '@/components/product/category-tabs';
import { ProductGrid } from '@/components/product/product-grid';
import { PackList } from '@/components/product/pack-list';
import { RestaurantJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_NAME } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vendor = await getVendor(slug);

  if (!vendor) {
    return {
      title: 'Restaurant non trouvé',
    };
  }

  const title = `${vendor.name} - Livraison à Dakar`;
  const description = vendor.description ||
    `Commandez chez ${vendor.name} et faites-vous livrer rapidement à Dakar. Menu, prix et avis sur ${APP_NAME}.`;

  return {
    title,
    description,
    keywords: [
      vendor.name,
      'livraison',
      'Dakar',
      'restaurant',
      'commande en ligne',
      ...(vendor.tags || []),
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      images: vendor.cover_image_url ? [
        {
          url: vendor.cover_image_url,
          width: 1200,
          height: 630,
          alt: vendor.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: vendor.cover_image_url ? [vendor.cover_image_url] : [],
    },
    alternates: {
      canonical: `/restaurants/${vendor.slug}`,
    },
  };
}

function ProductsSkeleton() {
  return (
    <div className="px-4 space-y-8">
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-32 sm:h-36 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function RestaurantContent({ slug }: { slug: string }) {
  const vendor = await getVendor(slug);

  if (!vendor) {
    notFound();
  }

  const [categories, products, packs] = await Promise.all([
    getVendorCategories(vendor.id),
    getVendorProducts(vendor.id),
    getVendorPacks(vendor.id),
  ]);

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Restaurants', url: '/restaurants' },
    { name: vendor.name, url: `/restaurants/${vendor.slug}` },
  ];

  // Filter categories that have products
  const categoriesWithProducts = categories.filter(
    (cat) => products.some((p) => p.vendor_category_id === cat.id)
  );

  // If there are packs, add them as a virtual category
  const allCategories = packs.length > 0
    ? [...categoriesWithProducts, { id: 'packs', name: `Packs (${packs.length})`, vendor_id: vendor.id, slug: 'packs', description: null, image_url: null, sort_order: 999, is_active: true, created_at: '' }]
    : categoriesWithProducts;

  return (
    <div className="min-h-screen bg-background pb-20">
      <RestaurantJsonLd vendor={vendor} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* Mobile Header */}
      <EstablishmentHeaderMobile establishment={vendor} />

      {/* Category Tabs */}
      {allCategories.length > 0 && (
        <CategoryTabs categories={allCategories} />
      )}

      {/* Products Grid */}
      <div className="py-4">
        <ProductGrid
          products={products}
          categories={categoriesWithProducts}
          vendorId={vendor.id}
          vendor={vendor}
          emptyMessage="Aucun produit disponible pour le moment."
        />

        {/* Packs Section */}
        {packs.length > 0 && (
          <div className="mt-8">
            <h2
              className="text-lg font-semibold mb-4 px-4"
              id="category-packs"
            >
              Packs ({packs.length})
            </h2>
            <div className="px-4">
              <PackList packs={packs} vendorId={vendor.id} vendor={vendor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="sticky top-0 z-50 bg-background border-b">
            <div className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
          <div className="sticky top-[60px] z-40 bg-background border-b">
            <div className="flex gap-2 px-4 py-3">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-20 rounded-full" />
            </div>
          </div>
          <div className="py-4">
            <ProductsSkeleton />
          </div>
        </div>
      }
    >
      <RestaurantContent slug={slug} />
    </Suspense>
  );
}
