import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import { getVendor, getProduct } from '@/actions/catalog';
import { ProductDetailView } from '@/components/product/product-detail-view';
import { Button } from '@/components/ui/button';
import { APP_NAME, CURRENCY } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string; productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productId } = await params;
  const [vendor, product] = await Promise.all([
    getVendor(slug),
    getProduct(productId),
  ]);

  if (!vendor || !product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  const title = `${product.name} | ${vendor.name}`;
  const description = `${product.price.toLocaleString('fr-FR')} ${CURRENCY} - Commandez sur ${APP_NAME}`;
  const ogDescription = `${product.price.toLocaleString('fr-FR')} ${CURRENCY} chez ${vendor.name}`;

  return {
    title,
    description,
    openGraph: {
      title: product.name,
      description: ogDescription,
      type: 'website',
      siteName: APP_NAME,
      images: product.image_url ? [
        {
          url: product.image_url,
          width: 600,
          height: 600,
          alt: product.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: ogDescription,
      images: product.image_url ? [product.image_url] : [],
    },
    alternates: {
      canonical: `/commerces/${slug}/produit/${productId}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug, productId } = await params;
  const [vendor, product] = await Promise.all([
    getVendor(slug),
    getProduct(productId),
  ]);

  // If vendor not found, 404
  if (!vendor) {
    notFound();
  }

  // If product not found, 404
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={`/commerces/${slug}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{product.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{vendor.name}</p>
          </div>
          <Link href="/panier">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Image */}
      <div className="relative aspect-square bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🛒</span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <ProductDetailView product={product} vendor={vendor} />

      {/* Vendor Info */}
      <div className="p-4 border-t">
        <Link
          href={`/commerces/${slug}`}
          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
            {vendor.logo_url ? (
              <Image
                src={vendor.logo_url}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xl">
                🏪
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{vendor.name}</p>
            <p className="text-xs text-muted-foreground">Voir tous les produits</p>
          </div>
          <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
        </Link>
      </div>
    </div>
  );
}
