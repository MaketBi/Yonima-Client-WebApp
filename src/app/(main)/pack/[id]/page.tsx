import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Store, Package, Check, X } from 'lucide-react';
import { getPack } from '@/actions/catalog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { PackActions } from '@/components/product/pack-actions';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pack = await getPack(id);

  if (!pack) {
    return {
      title: 'Pack non trouvé',
    };
  }

  return {
    title: pack.name,
    description: pack.description || `Commandez le pack ${pack.name} sur Yonima`,
    openGraph: {
      images: pack.image_url ? [pack.image_url] : [],
    },
  };
}

function PackSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full" />
      <div className="container py-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

async function PackContent({ id }: { id: string }) {
  const pack = await getPack(id);

  if (!pack) {
    notFound();
  }

  const vendorInfo = (pack as any).vendor;

  return (
    <div className="pb-24">
      {/* Back button */}
      <div className="container py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="javascript:history.back()">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Pack Image */}
      <div className="relative aspect-video w-full bg-muted">
        {pack.image_url ? (
          <Image
            src={pack.image_url}
            alt={pack.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Package className="h-16 w-16 text-primary/50" />
          </div>
        )}

        {pack.order_count && pack.order_count > 10 && (
          <Badge className="absolute top-4 left-4 bg-orange-500">
            Populaire - {pack.order_count} commandes
          </Badge>
        )}
      </div>

      {/* Pack Info */}
      <div className="container py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{pack.name}</h1>
        </div>

        {pack.description && (
          <p className="text-muted-foreground">{pack.description}</p>
        )}

        {/* Pack Items */}
        {pack.pack_items && pack.pack_items.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-3">
                Contenu du pack ({pack.pack_items.length} articles)
              </h2>
              <div className="space-y-2">
                {pack.pack_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      {item.available ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className={!item.available ? 'text-muted-foreground line-through' : ''}>
                        {item.name}
                      </span>
                    </div>
                    <Badge variant="outline">x{item.quantity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
      <PackActions pack={pack} vendorId={pack.vendor_id} />
    </div>
  );
}

export default async function PackDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense fallback={<PackSkeleton />}>
      <PackContent id={id} />
    </Suspense>
  );
}
