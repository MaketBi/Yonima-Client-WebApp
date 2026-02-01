'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Minus, X, Package } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useToast } from '@/hooks/use-toast';
import { CURRENCY } from '@/lib/constants';
import type { Pack, Vendor } from '@/types/models';

interface PackModalProps {
  packs: Pack[];
  vendor: Vendor;
  basePath: string; // '/restaurants' or '/commerces'
}

export function PackModal({ packs, vendor, basePath }: PackModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { items, addItem, updateQuantity, removeItem, canAddFromEstablishment } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [pack, setPack] = useState<Pack | null>(null);

  const packId = searchParams.get('pack');

  useEffect(() => {
    if (packId) {
      const found = packs.find((p) => p.id === packId);
      if (found) {
        setPack(found);
        setIsOpen(true);
      } else {
        // Pack not found - show toast and clear param
        toast({
          title: 'Pack non disponible',
          description: 'Ce pack n\'est plus disponible.',
          variant: 'destructive',
        });
        // Remove the query param
        router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
      }
    } else {
      setIsOpen(false);
      setPack(null);
    }
  }, [packId, packs, vendor.slug, basePath, router, toast]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove the query param when closing
    router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
  };

  const cartItem = pack ? items.find((item) => item.id === pack.id && item.type === 'pack') : null;
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!pack) return;

    if (!canAddFromEstablishment(vendor.id)) {
      return;
    }

    addItem(
      {
        id: pack.id,
        type: 'pack',
        name: pack.name,
        image_url: pack.image_url,
        price: pack.price,
        quantity: 1,
        vendor_id: vendor.id,
        establishment_id: vendor.id,
      },
      vendor
    );
  };

  const handleIncrement = () => {
    if (pack && cartItem) {
      updateQuantity(pack.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (!pack) return;
    if (quantity > 1) {
      updateQuantity(pack.id, quantity - 1);
    } else {
      removeItem(pack.id);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} ${CURRENCY}`;
  };

  if (!pack) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Image */}
          <div className="relative h-48 bg-muted shrink-0">
            {pack.image_url ? (
              <Image
                src={pack.image_url}
                alt={pack.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Package className="h-16 w-16 text-primary/50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl">{pack.name}</SheetTitle>
              <p className="text-primary font-semibold text-lg">
                {formatPrice(pack.price)}
              </p>
            </SheetHeader>

            {pack.description && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground text-sm">{pack.description}</p>
              </div>
            )}

            {/* Pack Items */}
            {pack.pack_items && pack.pack_items.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-3">
                  Contenu du pack ({pack.pack_items.length} articles)
                </h3>
                <div className="space-y-2">
                  {pack.pack_items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">{item.name}</span>
                        {item.quantity > 1 && (
                          <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Add to cart */}
          <div className="p-4 border-t bg-background shrink-0">
            {quantity > 0 ? (
              <div className="flex items-center justify-between">
                <span className="font-medium">Quantité</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={handleDecrement}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    onClick={handleIncrement}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button className="w-full h-12 text-base" onClick={handleAddToCart}>
                <Plus className="h-5 w-5 mr-2" />
                Ajouter au panier - {formatPrice(pack.price)}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
