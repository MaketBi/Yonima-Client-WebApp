import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getVendor, getVendorCategories, getVendorProducts, getVendorPacks } from '@/actions/catalog';
import { EstablishmentHeader } from '@/components/establishment/establishment-header';
import { CategoryNav } from '@/components/product/category-nav';
import { ProductList } from '@/components/product/product-list';
import { PackList } from '@/components/product/pack-list';
import { RestaurantJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
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

async function RestaurantContent({ slug }: { slug: string }) {
  const [vendor, categories, products, packs] = await Promise.all([
    getVendor(slug),
    getVendor(slug).then((v) => (v ? getVendorCategories(v.id) : [])),
    getVendor(slug).then((v) => (v ? getVendorProducts(v.id) : [])),
    getVendor(slug).then((v) => (v ? getVendorPacks(v.id) : [])),
  ]);

  if (!vendor) {
    notFound();
  }

  const hasPacks = packs.length > 0;

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    { name: 'Restaurants', url: '/restaurants' },
    { name: vendor.name, url: `/restaurants/${vendor.slug}` },
  ];

  return (
    <div>
      <RestaurantJsonLd vendor={vendor} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <EstablishmentHeader establishment={vendor} />

      {hasPacks ? (
        <Tabs defaultValue="menu" className="mt-4">
          <div className="container">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="packs">Packs ({packs.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="menu" className="mt-0">
            {categories.length > 0 && <CategoryNav categories={categories} />}
            <div className="container py-4">
              <ProductList
                products={products}
                categories={categories}
                vendorId={vendor.id}
                vendor={vendor}
                emptyMessage="Aucun produit disponible pour le moment."
              />
            </div>
          </TabsContent>

          <TabsContent value="packs" className="mt-0">
            <div className="container py-4">
              <PackList packs={packs} vendorId={vendor.id} vendor={vendor} />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {categories.length > 0 && <CategoryNav categories={categories} />}
          <div className="container py-4">
            <ProductList
              products={products}
              categories={categories}
              vendorId={vendor.id}
              vendor={vendor}
              emptyMessage="Aucun produit disponible pour le moment."
            />
          </div>
        </>
      )}
    </div>
  );
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params;

  return (
    <Suspense
      fallback={
        <div>
          <Skeleton className="h-48 md:h-64 w-full" />
          <div className="container py-4">
            <ProductsSkeleton />
          </div>
        </div>
      }
    >
      <RestaurantContent slug={slug} />
    </Suspense>
  );
}
