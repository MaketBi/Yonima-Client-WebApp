'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Banknote,
  ExternalLink,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { SafeImage } from '@/components/shared/safe-image';
import { useCartStore } from '@/stores/cart-store';
import { useDeliveryAddressStore } from '@/stores/delivery-address-store';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/utils';
import { ROUTES, PAYMENT_METHODS } from '@/lib/constants';
import { AddressPickerScreen } from '@/components/checkout/address-picker-screen';
import {
  createOrder,
  initiatePayment,
  checkPaymentStatus,
  type OrderItemRequest,
} from '@/actions/orders';
import type { PaymentMethod, CartItem } from '@/types/models';

// Utility function to convert cart items to order items
function cartItemsToOrderItems(items: CartItem[]): OrderItemRequest[] {
  return items.map((item) => ({
    productId: item.type === 'product' ? item.id : undefined,
    packId: item.type === 'pack' ? item.id : undefined,
    quantity: item.quantity,
    unitPrice: item.price,
    itemName: item.name,
    itemType: item.type,
  }));
}

// Payment method icons (Wave and Orange Money logos)
const WaveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#1BA0E1" />
    <path
      d="M6 12C6 12 8 8 12 8C16 8 18 12 18 12C18 12 16 16 12 16C8 16 6 12 6 12Z"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2" fill="white" />
  </svg>
);

const OrangeMoneyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#FF6600" />
    <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2" />
    <path d="M12 8V12L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Checkout state types
type CheckoutState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'payment_pending'; payment_id: string; redirect_url: string }
  | { type: 'payment_processing' }
  | { type: 'success'; order_id: string; order_number: string }
  | { type: 'error'; message: string }
  | { type: 'out_of_stock'; item_name: string; available_stock?: number };

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

  // Get delivery address from shared store
  const deliveryAddressStore = useDeliveryAddressStore();

  const [checkoutState, setCheckoutState] = useState<CheckoutState>({ type: 'idle' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal() - promoDiscount;

  // Check if phone is required (mobile payments)
  const isPhoneRequired = paymentMethod === 'wave' || paymentMethod === 'orange_money';

  // Redirect if cart is empty or not authenticated
  // BUT don't redirect if we're in success or payment_pending state
  useEffect(() => {
    if (items.length === 0 && checkoutState.type !== 'success' && checkoutState.type !== 'payment_pending') {
      router.push(ROUTES.panier);
    }
  }, [items.length, router, checkoutState.type]);

  useEffect(() => {
    if (!user && checkoutState.type !== 'success') {
      router.push(ROUTES.login);
    }
  }, [user, router, checkoutState.type]);

  // Store payment ID separately to avoid dependency issues
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);

  // Polling for payment status with timeout
  useEffect(() => {
    if (!pendingPaymentId) return;

    console.log('[Checkout] Starting payment polling for:', pendingPaymentId);
    let pollCount = 0;
    const maxPolls = 60; // 60 polls * 3 seconds = 3 minutes timeout
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;

      pollCount++;
      console.log(`[Checkout] Poll #${pollCount} for payment:`, pendingPaymentId);

      // Timeout after 3 minutes
      if (pollCount >= maxPolls) {
        console.log('[Checkout] Polling timeout reached');
        setCheckoutState({
          type: 'error',
          message: 'Le délai de paiement a expiré. Si vous avez effectué le paiement, votre commande sera traitée automatiquement. Sinon, veuillez réessayer.',
        });
        setPendingPaymentId(null);
        return;
      }

      try {
        const result = await checkPaymentStatus(pendingPaymentId);
        console.log('[Checkout] Payment status result:', result);

        if (!isActive) return;

        if (result.success && result.status) {
          if (result.status === 'paid') {
            console.log('[Checkout] Payment confirmed!', result);
            if (result.order_id && result.order_number) {
              // IMPORTANT: Set success state BEFORE clearing cart to prevent redirect
              setCheckoutState({
                type: 'success',
                order_id: result.order_id,
                order_number: result.order_number,
              });
              setPendingPaymentId(null);
              // Clear cart after state is set
              clear();
            } else {
              // Payment confirmed but order creation failed
              setCheckoutState({
                type: 'error',
                message: 'Votre paiement a été reçu mais une erreur est survenue lors de la création de la commande. Notre équipe a été notifiée et vous contactera sous peu.',
              });
              setPendingPaymentId(null);
            }
            return;
          } else if (['failed', 'cancelled', 'expired'].includes(result.status)) {
            console.log('[Checkout] Payment failed/cancelled/expired:', result.status);
            setCheckoutState({
              type: 'error',
              message: `Paiement ${result.status === 'failed' ? 'échoué' : result.status === 'cancelled' ? 'annulé' : 'expiré'}. Veuillez réessayer.`,
            });
            setPendingPaymentId(null);
            return;
          }
        }

        // Continue polling
        if (isActive) {
          setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error('[Checkout] Error polling payment status:', error);
        // Continue polling on error
        if (isActive) {
          setTimeout(poll, 3000);
        }
      }
    };

    // Start polling
    poll();

    return () => {
      console.log('[Checkout] Stopping payment polling');
      isActive = false;
    };
  }, [pendingPaymentId, clear]);

  // Format phone number for display
  const formatPhoneInput = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 9); // Max 9 digits (Senegalese format)
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerPhone(formatPhoneInput(e.target.value));
  };

  // Check if address is valid
  const hasValidAddress = deliveryAddressStore.hasAddress() && deliveryAddressStore.isZoneCovered;

  // Validate form
  const isFormValid = useCallback(() => {
    if (!hasValidAddress) return false;
    if (isPhoneRequired && customerPhone.length < 9) return false;
    return true;
  }, [hasValidAddress, isPhoneRequired, customerPhone]);

  // Handle checkout submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      if (!hasValidAddress) {
        setIsAddressPickerOpen(true);
        return;
      }
      if (isPhoneRequired && customerPhone.length < 9) {
        setCheckoutState({ type: 'error', message: 'Veuillez entrer un numéro de téléphone valide' });
        return;
      }
      return;
    }

    if (!establishment) {
      setCheckoutState({ type: 'error', message: 'Erreur: établissement non défini' });
      return;
    }

    setCheckoutState({ type: 'loading' });

    const orderItems = cartItemsToOrderItems(items);
    // Build delivery address from store
    const deliveryAddressData = {
      formattedAddress: deliveryAddressStore.getFullAddress(),
      latitude: deliveryAddressStore.latitude || undefined,
      longitude: deliveryAddressStore.longitude || undefined,
      additionalInfo: deliveryAddressStore.additionalInfo || undefined,
    };

    try {
      if (paymentMethod === 'cash') {
        // Cash payment: create order directly
        const result = await createOrder({
          vendor_id: establishment.id,
          items: orderItems,
          delivery_address: deliveryAddressData,
          payment_method: 'cash',
          subtotal,
          delivery_fee: deliveryFee,
          total,
          promo_code: promoCode || undefined,
          promo_discount: promoDiscount || undefined,
        });

        if (result.success && result.order_id && result.order_number) {
          // Set success state BEFORE clearing cart to prevent redirect
          setCheckoutState({
            type: 'success',
            order_id: result.order_id,
            order_number: result.order_number,
          });
          clear();
        } else if (result.out_of_stock) {
          setCheckoutState({
            type: 'out_of_stock',
            item_name: result.item_name || 'Article',
            available_stock: result.available_stock,
          });
        } else {
          setCheckoutState({
            type: 'error',
            message: result.error || 'Erreur lors de la création de la commande',
          });
        }
      } else {
        // Mobile payment: initiate payment flow
        const result = await initiatePayment({
          amount: total,
          payment_method: paymentMethod as 'wave' | 'orange_money',
          customer_name: user?.full_name || 'Client Yonima',
          customer_phone: `+221${customerPhone}`,
          order_data: {
            vendor_id: establishment.id,
            items: orderItems,
            delivery_address: deliveryAddressData,
            subtotal,
            delivery_fee: deliveryFee,
            total,
            promo_code: promoCode || undefined,
            promo_discount: promoDiscount || undefined,
          },
        });

        console.log('[Checkout] initiatePayment result:', result);

        if (result.success) {
          // Check for sandbox instant payment
          if (result.instant_payment && result.order_id && result.order_number) {
            console.log('[Checkout] Sandbox instant payment - order created');
            // Set success state BEFORE clearing cart to prevent redirect
            setCheckoutState({
              type: 'success',
              order_id: result.order_id,
              order_number: result.order_number,
            });
            clear();
          } else if (result.payment_id && result.redirect_url) {
            // Normal flow: redirect to payment page
            console.log('[Checkout] Starting payment flow, payment_id:', result.payment_id);
            setCheckoutState({
              type: 'payment_pending',
              payment_id: result.payment_id,
              redirect_url: result.redirect_url,
            });
            // Start polling for this payment
            setPendingPaymentId(result.payment_id);
            // Open payment URL in new tab
            window.open(result.redirect_url, '_blank');
          } else {
            setCheckoutState({
              type: 'error',
              message: 'Erreur lors de l\'initiation du paiement',
            });
          }
        } else {
          setCheckoutState({
            type: 'error',
            message: result.error || 'Erreur lors de l\'initiation du paiement',
          });
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutState({
        type: 'error',
        message: 'Une erreur est survenue. Veuillez réessayer.',
      });
    }
  };

  // Handle success: redirect to order details
  const handleViewOrder = () => {
    if (checkoutState.type === 'success') {
      router.push(`/commandes/${checkoutState.order_id}`);
    }
  };

  // Helper function for payment method label
  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case 'wave':
        return 'Wave';
      case 'orange_money':
        return 'Orange Money';
      case 'cash':
        return 'Paiement à la livraison';
      default:
        return 'Paiement confirmé';
    }
  };

  // Render loading state if cart is empty and not in success/pending state
  if (items.length === 0 && checkoutState.type !== 'success' && checkoutState.type !== 'payment_pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && checkoutState.type !== 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-56">
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

      {/* Error Alert */}
      {checkoutState.type === 'error' && (
        <div className="container pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{checkoutState.message}</p>
            </div>
            <button onClick={() => setCheckoutState({ type: 'idle' })}>
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Out of Stock Alert */}
      {checkoutState.type === 'out_of_stock' && (
        <div className="container pt-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-orange-800 text-sm font-medium">Stock insuffisant</p>
              <p className="text-orange-700 text-sm">
                "{checkoutState.item_name}" n'est plus disponible en quantité suffisante.
                {checkoutState.available_stock !== undefined && (
                  <> Stock disponible: {checkoutState.available_stock}</>
                )}
              </p>
            </div>
            <button onClick={() => setCheckoutState({ type: 'idle' })}>
              <X className="h-4 w-4 text-orange-600" />
            </button>
          </div>
        </div>
      )}

      <div className="container py-4 space-y-4">
        {/* Delivery Address */}
        <Card
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsAddressPickerOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              hasValidAddress ? 'bg-primary/10' : 'bg-orange-100'
            }`}>
              {hasValidAddress ? (
                <MapPin className="h-5 w-5 text-primary" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Adresse de livraison</p>
              {hasValidAddress ? (
                <>
                  <p className="font-medium truncate">{deliveryAddressStore.getFullAddress()}</p>
                  {deliveryAddressStore.additionalInfo && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {deliveryAddressStore.additionalInfo}
                    </p>
                  )}
                </>
              ) : (
                <p className="font-medium text-orange-600">Sélectionner une adresse</p>
              )}
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground rotate-180 flex-shrink-0" />
          </div>
        </Card>

        {/* Zone not covered warning */}
        {deliveryAddressStore.hasAddress() && !deliveryAddressStore.isZoneCovered && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Zone non couverte</p>
              <p className="text-xs text-muted-foreground mt-1">
                L&apos;adresse sélectionnée n&apos;est pas dans notre zone de livraison.
              </p>
            </div>
          </div>
        )}

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
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold">Mode de paiement</h3>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Wave */}
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'wave'
                  ? 'border-[#1BA0E1] bg-[#1BA0E1]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('wave')}
            >
              <WaveIcon />
              <span className={`text-sm font-medium ${paymentMethod === 'wave' ? 'text-[#1BA0E1]' : ''}`}>
                Wave
              </span>
              {paymentMethod === 'wave' && (
                <CheckCircle2 className="h-4 w-4 text-[#1BA0E1] absolute top-2 right-2" />
              )}
            </button>

            {/* Orange Money */}
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'orange_money'
                  ? 'border-[#FF6600] bg-[#FF6600]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('orange_money')}
            >
              <OrangeMoneyIcon />
              <span className={`text-sm font-medium ${paymentMethod === 'orange_money' ? 'text-[#FF6600]' : ''}`}>
                Orange Money
              </span>
            </button>

            {/* Cash */}
            <button
              type="button"
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'cash'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setPaymentMethod('cash')}
            >
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <Banknote className="h-4 w-4 text-white" />
              </div>
              <span className={`text-sm font-medium ${paymentMethod === 'cash' ? 'text-green-600' : ''}`}>
                Espèces
              </span>
            </button>
          </div>

          {/* Phone Number Input (for mobile payments) */}
          {isPhoneRequired && (
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="phone">Numéro de téléphone {paymentMethod === 'wave' ? 'Wave' : 'Orange Money'}</Label>
              <div className="flex">
                <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md text-sm text-muted-foreground">
                  +221
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="77 123 45 67"
                  value={customerPhone}
                  onChange={handlePhoneChange}
                  className="rounded-l-none"
                  maxLength={9}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Vous recevrez une demande de paiement sur ce numéro
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Summary - above BottomNav */}
      <div className="fixed bottom-16 left-0 right-0 bg-background border-t shadow-lg z-40">
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
            disabled={checkoutState.type === 'loading' || !isFormValid()}
          >
            {checkoutState.type === 'loading' ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : paymentMethod === 'cash' ? (
              `Commander - ${formatPrice(total)}`
            ) : (
              `Payer avec ${PAYMENT_METHODS[paymentMethod].label} - ${formatPrice(total)}`
            )}
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={checkoutState.type === 'success'} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md p-0 gap-0 rounded-2xl overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Commande confirmée</DialogTitle>
          <DialogDescription className="sr-only">Votre commande a été confirmée avec succès</DialogDescription>

          {/* Success content */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-green-500 to-green-700 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
              <div className="absolute -inset-1 rounded-full border-4 border-green-200" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Commande confirmée !</h2>
            <p className="text-muted-foreground mb-6">Merci pour votre confiance</p>

            {/* Order number */}
            <div className="w-full bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-muted-foreground text-center mb-2">Numéro de commande</p>
              <div className="flex justify-center">
                <span className="bg-green-100 text-green-700 px-6 py-2 rounded-lg text-xl font-bold tracking-wide">
                  {checkoutState.type === 'success' ? checkoutState.order_number : ''}
                </span>
              </div>
            </div>

            {/* Payment method */}
            <div className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mode de paiement</p>
                <p className="font-semibold text-sm">{getPaymentMethodLabel()}</p>
              </div>
            </div>

            {/* WhatsApp notification */}
            <div className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Notification WhatsApp</p>
                <p className="text-xs text-muted-foreground">Vous recevrez les mises à jour</p>
              </div>
            </div>
          </div>

          {/* Bottom button */}
          <div className="p-4 pt-0">
            <Button
              className="w-full h-12 text-base bg-green-700 hover:bg-green-800 rounded-xl"
              onClick={() => router.push('/')}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Pending Dialog */}
      <Dialog open={checkoutState.type === 'payment_pending'} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md rounded-2xl [&>button]:hidden">
          <DialogTitle className="sr-only">En attente de paiement</DialogTitle>
          <DialogDescription className="sr-only">Veuillez compléter votre paiement</DialogDescription>

          <div className="flex flex-col items-center py-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">En attente de paiement</h2>
            <p className="text-muted-foreground text-center mb-6">
              Veuillez compléter votre paiement dans la fenêtre qui s&apos;est ouverte.
            </p>
            <Button
              variant="outline"
              className="w-full h-12 mb-3"
              onClick={() => {
                if (checkoutState.type === 'payment_pending') {
                  window.open(checkoutState.redirect_url, '_blank');
                }
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir la page de paiement
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              La page sera mise à jour automatiquement une fois le paiement confirmé.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Picker Dialog */}
      <AddressPickerScreen
        open={isAddressPickerOpen}
        onOpenChange={setIsAddressPickerOpen}
      />
    </div>
  );
}
