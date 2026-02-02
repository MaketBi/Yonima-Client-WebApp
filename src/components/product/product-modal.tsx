'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Plus, Minus, X, Share2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useCart } from '@/providers/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { CURRENCY } from '@/lib/constants';
import type { Product, Vendor } from '@/types/models';

interface ProductModalProps {
  products: Product[];
  vendor: Vendor;
  basePath: string; // '/restaurants' or '/commerces' or '/epiceries'
}

export function ProductModal({ products, vendor, basePath }: ProductModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { items, updateQuantity, removeItem } = useCartStore();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [localQuantity, setLocalQuantity] = useState(1);

  const productId = searchParams.get('produit');

  useEffect(() => {
    if (productId) {
      const found = products.find((p) => p.id === productId);
      if (found) {
        setProduct(found);
        setIsOpen(true);
        // Reset local quantity when opening a new product
        const existingItem = items.find((item) => item.id === found.id && item.type === 'product');
        setLocalQuantity(existingItem?.quantity || 1);
      } else {
        toast({
          title: 'Produit non disponible',
          description: 'Ce produit n\'est plus disponible.',
          variant: 'destructive',
        });
        router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
      }
    } else {
      setIsOpen(false);
      setProduct(null);
    }
  }, [productId, products, vendor.slug, basePath, router, toast, items]);

  const handleClose = () => {
    setIsOpen(false);
    router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
  };

  const cartItem = product ? items.find((item) => item.id === product.id && item.type === 'product') : null;
  const quantityInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!product) return;

    if (quantityInCart > 0) {
      // Update quantity if already in cart
      updateQuantity(product.id, localQuantity);
    } else {
      // Add new item
      addToCart(
        {
          id: product.id,
          type: 'product',
          name: product.name,
          image_url: product.image_url,
          price: product.price,
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
    if (!product) return;

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.poulzz.store';
    const shareUrl = `${siteUrl}${basePath}/${vendor.slug}/produit/${product.id}`;
    const shareText = `${product.name} - ${formatPrice(product.price)} chez ${vendor.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
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

  if (!product) return null;

  const isAvailable = product.is_available && product.is_active;
  const totalPrice = product.price * localQuantity;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0 overflow-hidden">
        <VisuallyHidden.Root>
          <SheetTitle>{product.name}</SheetTitle>
        </VisuallyHidden.Root>
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
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-medium bg-red-500 px-4 py-2 rounded-full">
                  Indisponible
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* Name */}
              <h1 className="text-2xl font-bold">{product.name}</h1>

              {/* Price */}
              <p className="text-lg text-muted-foreground mt-1">
                {formatPrice(product.price)}
              </p>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground mt-3">
                  {product.description}
                </p>
              )}

              {/* Separator */}
              <div className="border-t my-4" />

              {/* Options placeholder */}
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="font-medium text-muted-foreground">Options disponibles bientôt</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Les suppléments et options personnalisables seront ajoutés prochainement.
                </p>
              </div>
            </div>
          </div>

          {/* Footer - Quantity selector and Add to cart */}
          {isAvailable && (
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
