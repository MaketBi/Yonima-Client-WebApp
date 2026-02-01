import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Store } from 'lucide-react';
import { getProduct, getVendor } from '@/actions/catalog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductActions } from '@/components/product/product-actions';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo';
import { APP_NAME } from '@/lib/constants';
import { formatPrice } from '@/lib/utils';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  const vendorInfo = (product as any).vendor;
  const vendorName = vendorInfo?.name || '';
  const priceText = formatPrice(product.price);

  const title = `${product.name}${vendorName ? ` - ${vendorName}` : ''} | ${APP_NAME}`;
  const description = product.description ||
    `${product.name} à ${priceText}. Commandez et faites-vous livrer rapidement à Dakar sur ${APP_NAME}.`;

  return {
    title,
    description,
    keywords: [product.name, vendorName, 'livraison', 'Dakar', 'commande'].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      images: product.image_url ? [
        {
          url: product.image_url,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

function ProductSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full max-w-lg mx-auto" />
      <div className="container py-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

async function ProductContent({ id }: { id: string }) {
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const vendorInfo = (product as any).vendor;
  const isAvailable = product.is_available && product.is_active;

  const breadcrumbs = [
    { name: 'Accueil', url: '/' },
    ...(vendorInfo ? [{ name: vendorInfo.name, url: `/restaurants/${vendorInfo.id}` }] : []),
    { name: product.name, url: `/produit/${product.id}` },
  ];

  return (
    <div className="pb-24">
      <ProductJsonLd product={product} vendor={vendorInfo} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      {/* Back button */}
      <div className="container py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="javascript:history.back()">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square w-full max-w-lg mx-auto bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Indisponible
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="container py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.unit && (
            <p className="text-muted-foreground">({product.unit})</p>
          )}
        </div>

        {product.description && (
          <p className="text-muted-foreground">{product.description}</p>
        )}

        {/* Vendor info */}
        {vendorInfo && (
          <Link
            href={`/restaurants/${vendorInfo.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors"
          >
            <div className="h-12 w-12 rounded-full bg-muted overflow-hidden relative">
              {vendorInfo.logo_url ? (
                <Image
                  src={vendorInfo.logo_url}
                  alt={vendorInfo.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{vendorInfo.name}</p>
              <p className="text-sm text-muted-foreground">Voir le menu</p>
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
          </Link>
        )}
      </div>

      {/* Fixed bottom actions */}
      {isAvailable && (
        <ProductActions
          product={product}
          vendorId={product.vendor_id}
        />
      )}
    </div>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent id={id} />
    </Suspense>
  );
}
