import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ShoppingCart, Package } from 'lucide-react';
import { getVendor, getPack } from '@/actions/catalog';
import { PackDetailView } from '@/components/product/pack-detail-view';
import { Button } from '@/components/ui/button';
import { APP_NAME, CURRENCY } from '@/lib/constants';

interface Props {
  params: Promise<{ slug: string; packId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, packId } = await params;
  const [vendor, pack] = await Promise.all([
    getVendor(slug),
    getPack(packId),
  ]);

  if (!vendor || !pack) {
    return {
      title: 'Pack non trouvé',
    };
  }

  const title = `${pack.name} | ${vendor.name}`;
  const description = `${pack.price.toLocaleString('fr-FR')} ${CURRENCY} - Commandez sur ${APP_NAME}`;
  const ogDescription = `${pack.price.toLocaleString('fr-FR')} ${CURRENCY} chez ${vendor.name}`;

  return {
    title,
    description,
    openGraph: {
      title: pack.name,
      description: ogDescription,
      type: 'website',
      siteName: APP_NAME,
      images: pack.image_url ? [
        {
          url: pack.image_url,
          width: 600,
          height: 600,
          alt: pack.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: pack.name,
      description: ogDescription,
      images: pack.image_url ? [pack.image_url] : [],
    },
    alternates: {
      canonical: `/restaurants/${slug}/pack/${packId}`,
    },
  };
}

export default async function PackDetailPage({ params }: Props) {
  const { slug, packId } = await params;
  const [vendor, pack] = await Promise.all([
    getVendor(slug),
    getPack(packId),
  ]);

  // If vendor not found, 404
  if (!vendor) {
    notFound();
  }

  // If pack not found, 404
  if (!pack) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={`/restaurants/${slug}`}>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{pack.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{vendor.name}</p>
          </div>
          <Link href="/panier">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Pack Image */}
      <div className="relative aspect-video bg-muted">
        {pack.image_url ? (
          <Image
            src={pack.image_url}
            alt={pack.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Package className="h-16 w-16 text-primary/50" />
          </div>
        )}
      </div>

      {/* Pack Details */}
      <PackDetailView pack={pack} vendor={vendor} />

      {/* Vendor Info */}
      <div className="p-4 border-t">
        <Link
          href={`/restaurants/${slug}`}
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
                🍴
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{vendor.name}</p>
            <p className="text-xs text-muted-foreground">Voir le menu complet</p>
          </div>
          <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180" />
        </Link>
      </div>
    </div>
  );
}
