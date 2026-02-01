'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag, MapPin, PlusCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SafeImage } from '@/components/shared/safe-image';
import { useCartStore } from '@/stores/cart-store';
import { useDeliveryAddressStore } from '@/stores/delivery-address-store';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { AddressPickerScreen } from '@/components/checkout/address-picker-screen';

export default function PanierPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    establishment,
    updateQuantity,
    removeItem,
    clear,
    getSubtotal,
    getDeliveryFee,
    getTotal,
  } = useCartStore();

  // Delivery address from shared store - subscribe to specific values for reactivity
  const {
    formattedAddress,
    city,
    neighborhood,
    additionalInfo,
    isZoneCovered,
    hasAddress,
    getFullAddress,
  } = useDeliveryAddressStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  // Get the URL to add more items from the same establishment
  const getEstablishmentUrl = () => {
    if (!establishment) return '/';

    const { type, slug, id } = establishment;
    const identifier = slug || id;

    switch (type) {
      case 'restaurant':
        return `/restaurants/${identifier}`;
      case 'store':
        return `/commerces/${identifier}`;
      case 'grocery':
        return '/epicerie';
      default:
        return '/';
    }
  };

  // Check if address is valid
  const hasValidAddress = hasAddress() && isZoneCovered;

  // Get display address
  const getDisplayAddress = () => {
    if (!hasAddress()) {
      return null;
    }
    return getFullAddress();
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }

    // Check if address is set
    if (!hasValidAddress) {
      setIsAddressPickerOpen(true);
      return;
    }

    setIsProcessing(true);
    router.push('/commandes/nouveau');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background border-b">
          <div className="container flex items-center justify-between h-14">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-semibold text-lg">Mon panier</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
          <p className="text-muted-foreground text-center mb-8">
            Ajoutez des articles depuis un restaurant ou une épicerie
          </p>
          <Button asChild>
            <Link href="/">Découvrir</Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayAddress = getDisplayAddress();

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">Mon panier</h1>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-destructive hover:text-destructive"
            onClick={() => clear()}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* Establishment Info */}
        {establishment && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <SafeImage
                  src={establishment.logo_url || ''}
                  alt={establishment.name}
                  fill
                  className="object-cover"
                  fallback={<ShoppingBag className="h-6 w-6 text-gray-400" />}
                  fallbackClassName="absolute inset-0"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{establishment.name}</h3>
                {establishment.estimated_time && (
                  <p className="text-sm text-muted-foreground">
                    Livraison en {establishment.estimated_time}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Cart Items */}
        <Card className="divide-y">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="p-4">
              <div className="flex gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <SafeImage
                    src={item.image_url || ''}
                    alt={item.name}
                    fill
                    className="object-cover"
                    fallback={<ShoppingBag className="h-6 w-6 text-gray-400" />}
                    fallbackClassName="absolute inset-0"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-2">{item.name}</h4>
                  <p className="text-primary font-semibold mt-1">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8 px-2"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>

                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Card>

        {/* Add more items button */}
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-2"
          asChild
        >
          <Link href={getEstablishmentUrl()}>
            <PlusCircle className="h-5 w-5 mr-2" />
            Ajouter d&apos;autres articles
          </Link>
        </Button>

        {/* Delivery Address */}
        <Card
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsAddressPickerOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              displayAddress ? 'bg-primary/10' : 'bg-orange-100'
            }`}>
              {displayAddress ? (
                <MapPin className="h-5 w-5 text-primary" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Adresse de livraison</p>
              {displayAddress ? (
                <p className="font-medium truncate">{displayAddress}</p>
              ) : (
                <p className="font-medium text-orange-600">Sélectionner une adresse</p>
              )}
              {additionalInfo && displayAddress && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {additionalInfo}
                </p>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </Card>

        {/* Zone not covered warning */}
        {hasAddress() && !isZoneCovered && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Zone non couverte</p>
              <p className="text-xs text-muted-foreground mt-1">
                L&apos;adresse sélectionnée n&apos;est pas dans notre zone de livraison. Veuillez choisir une autre adresse.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg">
        <div className="container py-4 space-y-3">
          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frais de livraison</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full h-12 text-base"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? 'Traitement...' : hasValidAddress ? 'Commander' : 'Sélectionner une adresse'}
          </Button>
        </div>
      </div>

      {/* Address Picker Dialog */}
      <AddressPickerScreen
        open={isAddressPickerOpen}
        onOpenChange={setIsAddressPickerOpen}
      />
    </div>
  );
}
