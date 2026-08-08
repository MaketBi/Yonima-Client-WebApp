import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bike, MapPin, Phone, User } from 'lucide-react';
import { getVendorSession } from '@/actions/vendor-auth';
import { fetchVendorOrder } from '@/actions/vendor-orders';
import { OrderStatusBadge } from '@/components/vendor/orders/order-status-badge';
import { OrderDetailActions } from '@/components/vendor/orders/order-detail-actions';
import {
  formatDeliveryFee,
  formatOrderDetailDate,
  formatVendorAmount,
  formatVendorPhone,
} from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  ORDER_STATUS_COLORS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type PaymentMethod,
  type PaymentStatus,
  type VendorOrder,
} from '@/types/vendor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { order } = await fetchVendorOrder(id);
  return { title: order ? `Commande ${order.order_number}` : 'Commande' };
}

/** Étapes horodatées, dans l'ordre du cycle de vie. */
function buildTimeline(order: VendorOrder): { label: string; at: string }[] {
  const steps: { label: string; at: string | null }[] = [
    { label: 'Commande créée', at: order.created_at },
    { label: 'Préparation terminée', at: order.prepared_at },
    { label: 'Prête pour livraison', at: order.ready_at },
    { label: 'Livreur assigné', at: order.driver_assigned_at },
    { label: 'Livreur en route', at: order.driver_on_the_way_at },
    { label: 'Livreur arrivé', at: order.arrived_at },
    { label: 'Livrée', at: order.delivered_at },
    { label: 'Annulée', at: order.cancelled_at },
  ];

  return steps.flatMap((step) => (step.at ? [{ label: step.label, at: step.at }] : []));
}

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-card">
      {title && (
        <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

export default async function VendeurCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getVendorSession();
  if (!session.ok) return null;

  const { order } = await fetchVendorOrder(id);
  if (!order) notFound();

  const { permissions, vendor, isOwner } = session.session;
  const items = order.order_items ?? [];
  const timeline = buildTimeline(order);
  const customerName = order.customer_name || order.user?.full_name || 'Client';
  const customerPhone = order.phone || order.user?.phone || null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href={VENDOR_ROUTES.commandes}
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Commandes
      </Link>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.04em]">
              {order.order_number}
            </h1>
            <p className="mt-1 text-[13.5px] text-ink-muted">
              {formatOrderDetailDate(order.created_at)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </Card>

      <OrderDetailActions
        order={order}
        canManageOrders={permissions.can_manage_orders}
        canAssignDrivers={permissions.can_assign_drivers}
        canAssignFromThisVendor={vendor.delivery_mode !== 'pool_only'}
        isOwner={isOwner}
      />

      <Card title="Client">
        <dl className="space-y-3 text-[14.5px]">
          <div className="flex items-start gap-2.5">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <dd>{customerName}</dd>
          </div>

          {customerPhone && (
            <div className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <dd>
                <a
                  href={`tel:${customerPhone}`}
                  className="font-medium text-green-forest hover:text-green-deep"
                >
                  {formatVendorPhone(customerPhone)}
                </a>
              </dd>
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <dd>{order.delivery_address || 'Adresse non spécifiée'}</dd>
          </div>

          {order.delivery_note && (
            <p className="pl-6 text-[13.5px] italic text-ink-muted">
              {order.delivery_note}
            </p>
          )}
        </dl>
      </Card>

      {order.driver && (
        <Card title="Livreur">
          <div className="flex items-center gap-2.5 text-[14.5px]">
            <Bike className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
            <span>{order.driver.name || 'Livreur'}</span>
            {order.driver.phone && (
              <a
                href={`tel:${order.driver.phone}`}
                className="ml-auto font-medium text-green-forest hover:text-green-deep"
              >
                {formatVendorPhone(order.driver.phone)}
              </a>
            )}
          </div>
        </Card>
      )}

      <Card title={`Articles (${items.length})`}>
        {items.length === 0 ? (
          <p className="text-[14px] text-ink-muted">Aucun article</p>
        ) : (
          <ul className="divide-y divide-neutral-300">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1 text-[14.5px]">
                  {item.display_name || item.item_name || 'Article'}
                </span>
                <span className="shrink-0 text-[14px] font-semibold text-green-forest">
                  x{item.quantity}
                </span>
                <span className="w-24 shrink-0 text-right text-[14.5px] font-semibold">
                  {formatVendorAmount(item.total_price)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Paiement">
        <dl className="space-y-2 text-[14.5px]">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Méthode</dt>
            <dd className="font-medium">
              {order.payment_method
                ? PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] ??
                  order.payment_method
                : '—'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Statut</dt>
            <dd
              className="font-semibold"
              style={{
                color:
                  order.payment_status === 'paid'
                    ? ORDER_STATUS_COLORS.delivered
                    : ORDER_STATUS_COLORS.pending,
              }}
            >
              {order.payment_status
                ? PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
                  order.payment_status
                : '—'}
            </dd>
          </div>
        </dl>
      </Card>

      <Card title="Total">
        <dl className="space-y-2 text-[14.5px]">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Sous-total</dt>
            <dd>{formatVendorAmount(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Livraison</dt>
            <dd>{formatDeliveryFee(order.delivery_fee)}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-300 pt-2.5 text-[17px] font-bold">
            <dt>Total</dt>
            <dd className="text-green-forest">{formatVendorAmount(order.total)}</dd>
          </div>
        </dl>
      </Card>

      {timeline.length > 0 && (
        <Card title="Historique">
          <ol className="space-y-4">
            {timeline.map((step, index) => (
              <li key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-green-forest" />
                  {index < timeline.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-neutral-300" />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-[14.5px] font-medium">{step.label}</p>
                  <p className="text-[13px] text-ink-muted">
                    {formatOrderDetailDate(step.at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {order.cancellation_reason && (
            <p className="mt-4 rounded-xl bg-destructive/5 px-3 py-2 text-[13.5px] text-destructive">
              {order.cancellation_reason}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
