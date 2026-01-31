'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SafeImage } from '@/components/shared/safe-image';
import { useCartStore } from '@/stores/cart-store';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/utils';
import { ROUTES, PAYMENT_METHODS } from '@/lib/constants';
import type { PaymentMethod } from '@/types/models';

const paymentIcons = {
  cash: Banknote,
  wave: Smartphone,
  orange_money: Smartphone,
  card: CreditCard,
};

export default function NouvelleCommandePage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    establishment,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    clear,
  } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal() - promoDiscount;

  // Redirect if cart is empty or not authenticated
  useEffect(() => {
    if (items.length === 0) {
      router.push(ROUTES.panier);
    }
  }, [items.length, router]);

  useEffect(() => {
    if (!user) {
      router.push(ROUTES.login);
    }
  }, [user, router]);

  const handleSubmit = async () => {
    if (!deliveryAddress.trim()) {
      alert('Veuillez entrer une adresse de livraison');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Call create-order edge function
      // For now, simulate order creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear cart and redirect to order confirmation
      clear();
      router.push('/commandes/confirmation');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Une erreur est survenue lors de la création de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href={ROUTES.panier}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">Confirmer la commande</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* Delivery Address */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Adresse de livraison</h3>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Ex: Sacré Coeur 3, Villa 123"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
            <Textarea
              placeholder="Instructions pour le livreur (optionnel)"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              rows={2}
            />
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Récapitulatif</h3>

          {establishment && (
            <div className="flex items-center gap-3 pb-3 border-b">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                <SafeImage
                  src={establishment.logo_url || ''}
                  alt={establishment.name}
                  fill
                  className="object-cover"
                  fallback={<ShoppingBag className="h-5 w-5 text-gray-400" />}
                  fallbackClassName="absolute inset-0"
                />
              </div>
              <span className="font-medium">{establishment.name}</span>
            </div>
          )}

          <div className="space-y-2">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Promo Code */}
        <Card className="p-4 space-y-3">
          <Label htmlFor="promo">Code promo</Label>
          <div className="flex gap-2">
            <Input
              id="promo"
              placeholder="Entrer un code promo"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            />
            <Button variant="outline" disabled={!promoCode}>
              Appliquer
            </Button>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Mode de paiement</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => {
              const Icon = paymentIcons[method];
              const isSelected = paymentMethod === method;
              return (
                <button
                  key={method}
                  type="button"
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod(method)}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                    {PAYMENT_METHODS[method].label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg">
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
            {promoDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Réduction</span>
                <span>-{formatPrice(promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total à payer</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full h-12 text-base"
            onClick={handleSubmit}
            disabled={isSubmitting || !deliveryAddress.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              `Payer ${formatPrice(total)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
