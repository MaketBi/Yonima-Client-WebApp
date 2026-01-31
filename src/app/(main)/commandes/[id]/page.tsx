'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Phone,
  Package,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SafeImage } from '@/components/shared/safe-image';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/utils';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ROUTES } from '@/lib/constants';
import { getOrder } from '@/actions/orders';
import type { Order, OrderStatus } from '@/types/models';

interface Props {
  params: Promise<{ id: string }>;
}

const statusSteps: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'driver_assigned',
  'delivering',
  'delivered',
];

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle2,
  preparing: Package,
  ready: CheckCircle2,
  driver_assigned: Truck,
  delivering: Truck,
  delivered: CheckCircle2,
};

export default function CommandeDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.login);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchOrder() {
      if (!user || !id) return;

      try {
        const data = await getOrder(id);
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchOrder();
    }
  }, [user, id]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-background border-b">
          <div className="container flex items-center justify-between h-14">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href={ROUTES.commandes}>
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-semibold text-lg">Commande</h1>
            <div className="w-10" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-muted-foreground">Commande non trouvée</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentStatusIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-14">
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href={ROUTES.commandes}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-semibold text-lg">Commande #{order.order_number}</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container py-4 space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`text-sm px-3 py-1 ${ORDER_STATUS_COLORS[order.status] || ''}`}
          >
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDate(order.created_at)}
          </span>
        </div>

        {/* Status Progress */}
        {order.status !== 'cancelled' && (
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Suivi de la commande</h3>
            <div className="space-y-3">
              {statusSteps.slice(0, order.status === 'delivered' ? statusSteps.length : currentStatusIndex + 2).map((status, index) => {
                const Icon = statusIcons[status] || CheckCircle2;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={status} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : ''}`}>
                        {ORDER_STATUS_LABELS[status]}
                      </p>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Vendor Info */}
        {order.vendor && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                <SafeImage
                  src={order.vendor.logo_url || ''}
                  alt={order.vendor.name}
                  fill
                  className="object-cover"
                  fallback={<ShoppingBag className="h-6 w-6 text-gray-400" />}
                  fallbackClassName="absolute inset-0"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{order.vendor.name}</h3>
                {order.vendor.phone && (
                  <a
                    href={`tel:${order.vendor.phone}`}
                    className="text-sm text-primary flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    {order.vendor.phone}
                  </a>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Delivery Address */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold">Adresse de livraison</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {order.delivery_address}
              </p>
              {order.delivery_note && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  Note: {order.delivery_note}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Articles commandés</h3>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-sm">
                  {item.quantity}x {item.item_name || 'Article'}
                </span>
                <span className="text-sm font-medium">
                  {formatPrice(item.total_price)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frais de livraison</span>
              <span>{formatPrice(order.delivery_fee)}</span>
            </div>
            {order.promo_discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Réduction promo</span>
                <span>-{formatPrice(order.promo_discount)}</span>
              </div>
            )}
            {order.loyalty_discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Réduction fidélité</span>
                <span>-{formatPrice(order.loyalty_discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Cancelled Reason */}
        {order.status === 'cancelled' && order.cancellation_reason && (
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-800">Commande annulée</h3>
            <p className="text-sm text-red-600 mt-1">
              Raison: {order.cancellation_reason}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
