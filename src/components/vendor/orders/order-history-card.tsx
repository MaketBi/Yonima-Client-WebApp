import Link from 'next/link';
import { Bike, ChevronRight } from 'lucide-react';
import { OrderStatusBadge } from './order-status-badge';
import {
  formatItemCount,
  formatOrderListDate,
  formatVendorAmount,
} from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import { ORDER_STATUS_COLORS, type VendorOrder } from '@/types/vendor';

/** Ligne compacte d'historique : pastille colorée, résumé, badge, chevron. */
export function OrderHistoryCard({ order }: { order: VendorOrder }) {
  const items = order.order_items ?? [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const customerName = order.customer_name || order.user?.full_name || 'Client';
  const color = ORDER_STATUS_COLORS[order.status] ?? '#7A7A7A';

  return (
    <Link
      href={VENDOR_ROUTES.commande(order.id)}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card transition-colors hover:bg-neutral-100/50"
    >
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[15px] font-bold">{order.order_number}</span>
          <span className="shrink-0 text-[15px] font-bold">
            {formatVendorAmount(order.total)}
          </span>
        </div>

        <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
          {customerName} • {formatItemCount(itemCount)} •{' '}
          {formatOrderListDate(order.created_at)}
        </p>

        {order.driver?.name && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-[12.5px] text-ink-muted">
            <Bike className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {order.driver.name}
          </p>
        )}

        <div className="mt-2">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-neutral-500"
        aria-hidden="true"
      />
    </Link>
  );
}
