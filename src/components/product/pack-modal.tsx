'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Minus, X, Package, Share2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useCart } from '@/providers/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { CURRENCY } from '@/lib/constants';
import type { Pack, Vendor } from '@/types/models';

interface PackModalProps {
  packs: Pack[];
  vendor: Vendor;
  basePath: string; // '/restaurants' or '/commerces' or '/epiceries'
}

export function PackModal({ packs, vendor, basePath }: PackModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { items, updateQuantity } = useCartStore();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [pack, setPack] = useState<Pack | null>(null);
  const [localQuantity, setLocalQuantity] = useState(1);

  const packId = searchParams.get('pack');

  useEffect(() => {
    if (packId) {
      const found = packs.find((p) => p.id === packId);
      if (found) {
        setPack(found);
        setIsOpen(true);
        // Reset local quantity when opening a new pack
        const existingItem = items.find((item) => item.id === found.id && item.type === 'pack');
        setLocalQuantity(existingItem?.quantity || 1);
      } else {
        toast({
          title: 'Pack non disponible',
          description: 'Ce pack n\'est plus disponible.',
          variant: 'destructive',
        });
        router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
      }
    } else {
      setIsOpen(false);
      setPack(null);
    }
  }, [packId, packs, vendor.slug, basePath, router, toast, items]);

  const handleClose = () => {
    setIsOpen(false);
    router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
  };

  const cartItem = pack ? items.find((item) => item.id === pack.id && item.type === 'pack') : null;
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!pack) return;

    if (quantityInCart > 0) {
      updateQuantity(pack.id, localQuantity);
    } else {
      addToCart(
        {
          id: pack.id,
          type: 'pack',
          name: pack.name,
          image_url: pack.image_url,
          price: pack.price,
          quantity: localQuantity,
          vendor_id: vendor.id,
          establishment_id: vendor.id,
        },
        vendor
      );
    }
    handleClose();
  };

  const handleIncrement = () => {
    setLocalQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (localQuantity > 1) {
      setLocalQuantity((q) => q - 1);
    }
  };

  const handleShare = async () => {
    if (!pack) return;

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.poulzz.store';
    const shareUrl = `${siteUrl}${basePath}/${vendor.slug}/pack/${pack.id}`;
    const shareText = `${pack.name} - ${formatPrice(pack.price)} chez ${vendor.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: pack.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Lien copié',
      description: 'Le lien a été copié dans le presse-papier.',
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} F CFA`;
  };

  if (!pack) return null;

  const totalPrice = pack.price * localQuantity;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header buttons */}
          <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
            <button
              onClick={handleClose}
              className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              className="h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center"
              aria-label="Partager"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Image */}
          <div className="relative h-72 bg-muted shrink-0">
            {pack.image_url ? (
              <Image
                src={pack.image_url}
                alt={pack.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Package className="h-16 w-16 text-primary/50" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Name */}
              <h1 className="text-2xl font-bold">{pack.name}</h1>

              {/* Price */}
              <p className="text-lg text-muted-foreground mt-1">
                {formatPrice(pack.price)}
              </p>

              {/* Description */}
              {pack.description && (
                <p className="text-muted-foreground mt-3">
                  {pack.description}
                </p>
              )}

              {/* Separator */}
              <div className="border-t my-4" />

              {/* Pack Items */}
              {pack.pack_items && pack.pack_items.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-3">
                    Contenu du pack ({pack.pack_items.length} articles)
                  </h3>
                  <div className="space-y-2">
                    {pack.pack_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
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
          </div>

          {/* Footer - Quantity selector and Add to cart */}
          <div className="p-4 border-t bg-background shrink-0 space-y-3">
            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleDecrement}
                disabled={localQuantity <= 1}
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="w-8 text-center font-semibold text-xl">{localQuantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleIncrement}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Add to cart button */}
            <Button
              className="w-full h-14 text-base font-semibold rounded-xl"
              onClick={handleAddToCart}
            >
              Ajouter {localQuantity} au panier • {formatPrice(totalPrice)}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
