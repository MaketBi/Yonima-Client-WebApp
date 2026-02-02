'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Minus, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cart-store';
import { useCart } from '@/providers/cart-provider';
import { useToast } from '@/hooks/use-toast';
import { CURRENCY } from '@/lib/constants';
import type { Product, Vendor } from '@/types/models';

interface ProductModalProps {
  products: Product[];
  vendor: Vendor;
  basePath: string; // '/restaurants' or '/commerces'
}

export function ProductModal({ products, vendor, basePath }: ProductModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { items, updateQuantity, removeItem } = useCartStore();
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const productId = searchParams.get('produit');

  useEffect(() => {
    if (productId) {
      const found = products.find((p) => p.id === productId);
      if (found) {
        setProduct(found);
        setIsOpen(true);
      } else {
        // Product not found - show toast and clear param
        toast({
          title: 'Produit non disponible',
          description: 'Ce produit n\'est plus disponible.',
          variant: 'destructive',
        });
        // Remove the query param
        router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
      }
    } else {
      setIsOpen(false);
      setProduct(null);
    }
  }, [productId, products, vendor.slug, basePath, router, toast]);

  const handleClose = () => {
    setIsOpen(false);
    // Remove the query param when closing
    router.replace(`${basePath}/${vendor.slug}`, { scroll: false });
  };

  const cartItem = product ? items.find((item) => item.id === product.id && item.type === 'product') : null;
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(
      {
        id: product.id,
        type: 'product',
        name: product.name,
        image_url: product.image_url,
        price: product.price,
        quantity: 1,
        vendor_id: vendor.id,
        establishment_id: vendor.id,
      },
      vendor
    );
  };

  const handleIncrement = () => {
    if (product && cartItem) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (!product) return;
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    } else {
      removeItem(product.id);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} ${CURRENCY}`;
  };

  if (!product) return null;

  const isAvailable = product.is_available && product.is_active;

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
          <div className="relative h-64 bg-muted shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
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
          <div className="flex-1 overflow-y-auto p-4">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-xl">{product.name}</SheetTitle>
              <p className="text-primary font-semibold text-lg">
                {formatPrice(product.price)}
              </p>
            </SheetHeader>

            {product.description && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground text-sm">{product.description}</p>
              </div>
            )}
          </div>

          {/* Footer - Add to cart */}
          {isAvailable && (
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
                  Ajouter au panier - {formatPrice(product.price)}
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
