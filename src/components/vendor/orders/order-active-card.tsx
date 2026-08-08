'use client';

import Link from 'next/link';
import {
  Bell,
  Bike,
  CheckCircle2,
  Flame,
  Loader2,
  Play,
  ShoppingBag,
  User,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatItemCount,
  formatVendorAmount,
} from '@/lib/vendor/format';
import { VENDOR_ROUTES } from '@/lib/vendor/constants';
import {
  ORDER_ACTION,
  ORDER_BANNER,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type VendorOrder,
} from '@/types/vendor';

const BANNER_ICONS = { pending: Bell, preparing: Flame, ready: CheckCircle2 };
const ACTION_ICONS = { pending: Play, preparing: CheckCircle2, ready: Bike };

interface OrderActiveCardProps {
  order: VendorOrder;
  /** Absent = pas de bouton d'action (permission manquante ou statut sans suite). */
  onAction?: (order: VendorOrder) => void;
  isPending?: boolean;
}

/** Carte « À traiter » : bandeau de statut, corps cliquable, bouton contextuel. */
export function OrderActiveCard({
  order,
  onAction,
  isPending = false,
}: OrderActiveCardProps) {
  const banner = ORDER_BANNER[order.status];
  const action = ORDER_ACTION[order.status];

  const BannerIcon = BANNER_ICONS[order.status as keyof typeof BANNER_ICONS];
  const ActionIcon = ACTION_ICONS[order.status as keyof typeof ACTION_ICONS];

  const items = order.order_items ?? [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const preview = items.slice(0, 3);
  const remaining = items.length - preview.length;

  const customerName =
    order.customer_name || order.user?.full_name || 'Client';

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-card">
      {banner && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-white"
          style={{ backgroundColor: banner.color }}
        >
          {BannerIcon && <BannerIcon className="h-4 w-4" aria-hidden="true" />}
          {banner.label}
        </div>
      )}

      <Link
        href={VENDOR_ROUTES.commande(order.id)}
        className="block p-4 transition-colors hover:bg-neutral-100/50"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[17px] font-bold tracking-[-0.02em]">
            {order.order_number}
          </span>
          <span className="text-[17px] font-bold text-green-forest">
            {formatVendorAmount(order.total)}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" aria-hidden="true" />
            {customerName}
          </span>
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            {formatItemCount(itemCount)}
          </span>
          {order.payment_method && (
            <span className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              {PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] ??
                order.payment_method}
            </span>
          )}
        </div>

        {preview.length > 0 && (
          <ul className="mt-3 space-y-1 text-[13.5px]">
            {preview.map((item) => (
              <li key={item.id}>
                • {item.quantity}x {item.display_name || item.item_name || 'Article'}
              </li>
            ))}
            {remaining > 0 && (
              <li className="text-ink-muted">
                + {remaining} autre{remaining > 1 ? 's' : ''} article
                {remaining > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        )}
      </Link>

      {action && onAction && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => onAction(order)}
            disabled={isPending}
            className={cn(
              'flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[14px] font-bold uppercase tracking-[0.04em] text-white transition-opacity',
              'hover:opacity-90 disabled:opacity-60'
            )}
            style={{ backgroundColor: action.color }}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              ActionIcon && <ActionIcon className="h-4 w-4" aria-hidden="true" />
            )}
            {action.label}
          </button>
        </div>
      )}
    </article>
  );
}
